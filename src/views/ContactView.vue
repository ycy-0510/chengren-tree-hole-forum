<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">Contact Us</h2>
    <form class="max-w-md mx-auto bg-gray-100 p-6 rounded shadow" @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block mb-2">Name*</label>
        <input type="text" name="name" v-model="name" required class="w-full p-2 border focus:border-sky-500 focus:outline-1 focus:outline-sky-500  focus:invalid:border-pink-500 focus:invalid:outline-1 focus:invalid:outline-pink-500 rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-2">Email*</label>
        <input type="email" name="email" v-model="email" required
          class="w-full p-2 border focus:border-sky-500 focus:outline-1 focus:outline-sky-500  focus:invalid:border-pink-500 focus:invalid:outline-1 focus:invalid:outline-pink-500  rounded" />
      </div>
      <div class="mb-4">
        <label class="block mb-2">Message*</label>
        <textarea name="message" v-model="message" required
          class="w-full p-2 h-32 border focus:border-sky-500 focus:outline-1 focus:outline-sky-500  focus:invalid:border-pink-500 focus:invalid:outline-1 focus:invalid:outline-pink-500  rounded"></textarea>
      </div>
      <vue-hcaptcha class="my-3" sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" :reCaptchaCompat="false" @verify="onVerify"></vue-hcaptcha>
      <button type="submit" class="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-400">
        Send
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Swal from 'sweetalert2'
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'

const WEB3FORMS_ACCESS_KEY = "d08401a4-5569-4276-b562-ea4f57a15aa7";
const name = ref("")
const email = ref("")
const message = ref("")
const captcha = ref("")

const onVerify = ((response: any) => {
  console.log("Captcha verified:", response);
  captcha.value = response;
});

const submitForm = async () => {
  Swal.fire({
    title: 'Submitting...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  });

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      name: name.value,
      email: email.value,
      message: message.value,
      from_name: "FRC####",
      'h-captcha-response': captcha.value,
    }),
  });
  const result = await response.json();
  Swal.close();
  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Submitted Successfully',
      text: 'We\'ll get back to you soon!',
      confirmButtonText: 'OK',
      confirmButtonColor: '#38bdf8',
      showCancelButton: false,
    });
    name.value = "";
    email.value = "";
    message.value = "";
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: 'Please try again later.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#38bdf8',
      showCancelButton: false,
    });
  }
};
</script>