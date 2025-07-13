from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import os
import uuid
from pathlib import Path
from typing import Optional, List
import aiofiles
from PIL import Image
import io
from datetime import datetime
from pydantic import BaseModel

app = FastAPI(title="論壇圖片上傳工具", description="用於上傳圖片並修改貼文資料的工具")

# 設定目錄路徑
BASE_DIR = Path(__file__).parent.parent
STATIC_DIR = BASE_DIR / "public" / "assets" / "images"
POST_JSON_PATH = BASE_DIR / "public" / "data" / "post.json"
BOARD_JSON_PATH = BASE_DIR / "public" / "data" / "board.json"
USER_JSON_PATH = BASE_DIR / "public" / "data" / "user.json"

# 確保圖片目錄存在
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Pydantic 模型定義
class PostCreate(BaseModel):
    boardId: str
    authorId: str
    title: str
    content: str
    tags: List[str]
    label: str
    createdAt: Optional[str] = None

class PostUpdate(BaseModel):
    boardId: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    label: Optional[str] = None
    createdAt: Optional[str] = None
    likes: Optional[int] = None
    shares: Optional[int] = None

class CommentCreate(BaseModel):
    userId: str
    content: str
    time: Optional[str] = None

class CommentUpdate(BaseModel):
    content: str
    time: Optional[str] = None

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

# 讀取版面資料
async def load_boards():
    try:
        async with aiofiles.open(BOARD_JSON_PATH, 'r', encoding='utf-8') as f:
            content = await f.read()
            return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"無法讀取版面資料: {str(e)}")

# 讀取用戶資料
async def load_users():
    try:
        async with aiofiles.open(USER_JSON_PATH, 'r', encoding='utf-8') as f:
            content = await f.read()
            return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"無法讀取用戶資料: {str(e)}")

# 生成唯一ID
def generate_id(prefix: str = "post") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

# 生成當前時間戳
def get_current_timestamp() -> str:
    return datetime.now().isoformat()

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
    boards = await load_boards()
    users = await load_users()
    return templates.TemplateResponse("index.html", {
        "request": request, 
        "posts": posts, 
        "boards": boards["boards"],
        "users": users
    })

@app.get("/post/{post_id}", response_class=HTMLResponse)
async def post_detail(request: Request, post_id: str):
    posts = await load_posts()
    boards = await load_boards()
    users = await load_users()
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    return templates.TemplateResponse("post_detail.html", {
        "request": request, 
        "post": post, 
        "boards": boards["boards"],
        "users": users
    })

# === 貼文相關 API ===

@app.post("/api/posts")
async def create_post(post: PostCreate):
    """創建新貼文"""
    posts = await load_posts()
    
    # 驗證版面和用戶存在
    boards = await load_boards()
    users = await load_users()
    
    if not any(b["id"] == post.boardId for b in boards["boards"]):
        raise HTTPException(status_code=400, detail="版面不存在")
    
    if not any(u["id"] == post.authorId for u in users):
        raise HTTPException(status_code=400, detail="用戶不存在")
    
    # 創建新貼文
    new_post = {
        "id": generate_id("post"),
        "boardId": post.boardId,
        "authorId": post.authorId,
        "title": post.title,
        "content": post.content,
        "image": None,
        "tags": post.tags,
        "label": post.label,
        "createdAt": post.createdAt if post.createdAt else get_current_timestamp(),
        "likes": 0,
        "shares": 0,
        "comments": []
    }
    
    posts.append(new_post)
    await save_posts(posts)
    
    return {"message": "貼文創建成功", "post": new_post}

@app.put("/api/posts/{post_id}")
async def update_post(post_id: str, post_update: PostUpdate):
    """更新貼文"""
    posts = await load_posts()
    
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    # 如果要更新版面，驗證版面是否存在
    if post_update.boardId is not None:
        boards = await load_boards()
        if not any(b["id"] == post_update.boardId for b in boards["boards"]):
            raise HTTPException(status_code=400, detail="版面不存在")
    
    # 更新貼文欄位
    if post_update.boardId is not None:
        posts[post_index]["boardId"] = post_update.boardId
    if post_update.title is not None:
        posts[post_index]["title"] = post_update.title
    if post_update.content is not None:
        posts[post_index]["content"] = post_update.content
    if post_update.tags is not None:
        posts[post_index]["tags"] = post_update.tags
    if post_update.label is not None:
        posts[post_index]["label"] = post_update.label
    if post_update.createdAt is not None:
        posts[post_index]["createdAt"] = post_update.createdAt
    if post_update.likes is not None:
        posts[post_index]["likes"] = post_update.likes
    if post_update.shares is not None:
        posts[post_index]["shares"] = post_update.shares
    
    await save_posts(posts)
    
    return {"message": "貼文更新成功", "post": posts[post_index]}

@app.delete("/api/posts/{post_id}")
async def delete_post(post_id: str):
    """刪除貼文"""
    posts = await load_posts()
    
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    post = posts[post_index]
    
    # 刪除相關圖片
    if post.get("image"):
        image_filename = post["image"].split("/")[-1]
        image_path = STATIC_DIR / image_filename
        if image_path.exists():
            image_path.unlink()
    
    # 刪除貼文
    posts.pop(post_index)
    await save_posts(posts)
    
    return {"message": "貼文刪除成功", "post_id": post_id}

@app.get("/api/posts")
async def get_posts():
    """獲取所有貼文"""
    posts = await load_posts()
    return posts

@app.get("/api/posts/{post_id}")
async def get_post(post_id: str):
    """獲取特定貼文"""
    posts = await load_posts()
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="貼文不存在")
    return post

@app.post("/upload/{post_id}")
async def upload_image(post_id: str, file: UploadFile = File(...)):
    """上傳圖片到貼文"""
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
    """刪除貼文圖片"""
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

# === 留言相關 API ===

@app.post("/api/posts/{post_id}/comments")
async def create_comment(post_id: str, comment: CommentCreate):
    """新增留言"""
    posts = await load_posts()
    users = await load_users()
    
    # 驗證貼文存在
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    # 驗證用戶存在
    if not any(u["id"] == comment.userId for u in users):
        raise HTTPException(status_code=400, detail="用戶不存在")
    
    # 創建新留言
    new_comment = {
        "id": generate_id("comment"),
        "userId": comment.userId,
        "time": comment.time if comment.time else get_current_timestamp(),
        "content": comment.content
    }
    
    posts[post_index]["comments"].append(new_comment)
    await save_posts(posts)
    
    return {"message": "留言創建成功", "comment": new_comment}

@app.put("/api/posts/{post_id}/comments/{comment_id}")
async def update_comment(post_id: str, comment_id: str, comment_update: CommentUpdate):
    """更新留言"""
    posts = await load_posts()
    
    # 找到貼文
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    # 找到留言（先檢查是否有id欄位，沒有的話用索引）
    comment_index = None
    for i, comment in enumerate(posts[post_index]["comments"]):
        if comment.get("id") == comment_id:
            comment_index = i
            break
    
    if comment_index is None:
        raise HTTPException(status_code=404, detail="留言不存在")
    
    # 更新留言內容
    posts[post_index]["comments"][comment_index]["content"] = comment_update.content
    if comment_update.time is not None:
        posts[post_index]["comments"][comment_index]["time"] = comment_update.time
    
    await save_posts(posts)
    
    return {"message": "留言更新成功", "comment": posts[post_index]["comments"][comment_index]}

@app.delete("/api/posts/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str):
    """刪除留言"""
    posts = await load_posts()
    
    # 找到貼文
    post_index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    # 找到留言
    comment_index = None
    for i, comment in enumerate(posts[post_index]["comments"]):
        if comment.get("id") == comment_id:
            comment_index = i
            break
    
    if comment_index is None:
        raise HTTPException(status_code=404, detail="留言不存在")
    
    # 刪除留言
    deleted_comment = posts[post_index]["comments"].pop(comment_index)
    await save_posts(posts)
    
    return {"message": "留言刪除成功", "comment_id": comment_id}

@app.get("/api/posts/{post_id}/comments")
async def get_comments(post_id: str):
    """獲取貼文所有留言"""
    posts = await load_posts()
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="貼文不存在")
    
    return post["comments"]

# === 輔助 API ===

@app.get("/api/boards")
async def get_boards():
    """獲取所有版面"""
    boards = await load_boards()
    return boards["boards"]

@app.get("/api/users")
async def get_users():
    """獲取所有用戶"""
    users = await load_users()
    return users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)