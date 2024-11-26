<template>
    <div class="preloader">
      <div class="book-container">
        <div class="book"></div>
        <div class="book"></div>
        <div class="book"></div>
      </div>
      <div class="bookshelf">Book Shelf</div>
    </div>
  </template>
  
  <script>
  export default {};
  </script>
  
  <style scoped>
  /* Import Google Font */
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap');
  
  .preloader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color:  #232D3F;
  }
  
  .book-container {
    display: flex;
    justify-content: space-evenly;
    gap: 10px;
  }
  
  .book {
    width: 50px;
    height: 80px;
    background-color: #3498db;
    border-radius: 5px;
    animation: upDown 1.5s ease-in-out infinite;
  }
  
  /* Books up and down animation */
  @keyframes upDown {
    0%, 100% {
      transform: translateY(0); /* Start at the original position */
    }
    50% {
      transform: translateY(-20px); /* Move up by 20px */
    }
  }
  
  .book:nth-child(1) {
    animation-delay: 0s;
  }
  
  .book:nth-child(2) {
    animation-delay: 0.3s;
  }
  
  .book:nth-child(3) {
    animation-delay: 0.6s;
  }
  
  /* Stylish Bookshelf Font */
  .bookshelf {
    margin-top: 20px;
    font-size: 32px;
    font-weight: 700;
    text-transform: uppercase;
    color: wheat;
    letter-spacing: 2px;
    font-family: 'Merriweather', serif; /* Apply the Merriweather font */
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); /* Optional: Add a subtle shadow for depth */
  }
  </style>
  