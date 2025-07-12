from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import os
import uuid
from pathlib import Path
from typing import Optional
import aiofiles
from PIL import Image
import io

app = FastAPI(title="論壇圖片上傳工具", description="用於上傳圖片並修改貼文資料的工具")

# 設定目錄路徑
BASE_DIR = Path(__file__).parent.parent
STATIC_DIR = BASE_DIR / "public" / "assets" / "images"
POST_JSON_PATH = BASE_DIR / "public" / "data" / "post.json"

# 確保圖片目錄存在
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# 設定模板和靜態文件
templates = Jinja2Templates(directory="templates")
app.mount("/assets/images", StaticFiles(directory=str(STATIC_DIR)), name="images")

# 讀取貼文資料
async def load_posts():
    try:
        async with aiofiles.open(POST_JSON_PATH, 'r', encoding='utf-8') as f:
            content = await f.read()
            return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"無法讀取貼文資料: {str(e)}")

# 儲存貼文資料
async def save_posts(posts):
    try:
        async with aiofiles.open(POST_JSON_PATH, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(posts, ensure_ascii=False, indent=4))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"無法儲存貼文資料: {str(e)}")

# 處理圖片上傳和調整大小
async def process_image(file: UploadFile, post_id: str) -> str:
    # 檢查文件類型
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="請上傳圖片文件")
    
    # 讀取圖片
    contents = await file.read()
    
    try:
        # 使用PIL處理圖片
        image = Image.open(io.BytesIO(contents))
        
        # 調整圖片大小 (最大寬度800px，保持比例)
        max_width = 800
        if image.width > max_width:
            ratio = max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # 轉換為RGB (如果是RGBA)
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        # 生成文件名
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
            file_extension = 'jpg'
        
        filename = f"{post_id}.{file_extension}"
        file_path = STATIC_DIR / filename
        
        # 儲存圖片
        image.save(file_path, quality=85, optimize=True)
        
        return f"/assets/images/{filename}"
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"圖片處理失敗: {str(e)}")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    posts = await load_posts()
    return templates.TemplateResponse("index.html", {"request": request, "posts": posts})

@app.get("/post/{post_id}", response_class=HTMLResponse)
async def post_detail(request: Request, post_id: str):
    posts = await load_posts()
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    return templates.TemplateResponse("post_detail.html", {"request": request, "post": post})

@app.post("/upload/{post_id}")
async def upload_image(post_id: str, file: UploadFile = File(...)):
    # 載入貼文資料
    posts = await load_posts()
    
    # 找到指定的貼文
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    # 處理圖片上傳
    image_path = await process_image(file, post_id)
    
    # 更新貼文的圖片路徑
    posts[post_index]["image"] = image_path
    
    # 儲存更新後的資料
    await save_posts(posts)
    
    return {
        "message": "圖片上傳成功",
        "post_id": post_id,
        "image_path": image_path
    }

@app.delete("/image/{post_id}")
async def delete_image(post_id: str):
    # 載入貼文資料
    posts = await load_posts()
    
    # 找到指定的貼文
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    post = posts[post_index]
    
    # 刪除圖片文件
    if post.get("image"):
        image_filename = post["image"].split("/")[-1]
        image_path = STATIC_DIR / image_filename
        if image_path.exists():
            image_path.unlink()
    
    # 清除貼文的圖片路徑
    posts[post_index]["image"] = None
    
    # 儲存更新後的資料
    await save_posts(posts)
    
    return {"message": "圖片刪除成功", "post_id": post_id}

@app.get("/api/posts")
async def get_posts():
    posts = await load_posts()
    return posts

@app.get("/api/posts/{post_id}")
async def get_post(post_id: str):
    posts = await load_posts()
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="貼文不存在")
    return post

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)