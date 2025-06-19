const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Ed-Tech</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #060606;
      margin: 0;
      padding: 0;
    }
    .ed-tech {
       min-height: 88vh;
      display: flex;
      justify-items: center;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #1F2225;
      padding: 30px;
      border-radius: 10px;
      border: 2px solid #444547 ;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .header {
      padding-bottom: 20px;
      border-bottom:1px solid #3c3d3f;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header h1 {
      margin: 0;
      color: #9E4B9E;
       font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
      font-size:35px;
      font-weight:bold;
    }
    .content {
      font-size: 16px;
      color: #333333;
      line-height: 1.8;
    }
    .p-2 {
       font-weight:600;
       color: white;
       font-size:xx-large;
       color: #B391F0;
       max-width: 400px;
       line-height:5vh;
    }
    .p-1{
       color: #dad5d5;
       line-height: 4vh;
       font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-size: 2.5vh;
       color: #9E4B9E;
    }
    .name{
       color: #b8afaf;
       line-height: 4vh;
       font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-size: 2.5vh;
    }
    .team{
       color: #b8afaf;
       line-height: 8px;
       font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-size: 1.6vh;
    }
    .button {
       width: 25vh;
       height: 7vh;
       padding: 2px;
       border-radius: 10px;
       background-color: #B391F0;
       cursor: pointer;
       font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
       font-weight: 600;
       font-size: larger;
       color: #FAFAFA;
    }
    .footer {
      margin-top: 30px;
      text-align: end;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
     <div class="ed-tech">
  <div class="container">
    <div class="header">
      <img src="C:\Users\PC\ed-tech\test\img\ai-avatar.png" alt="img" width="35" height="35">
      <h1>Ed-Tech</h1>
    </div>
    <div class="content">
      <p class="p-2">Welcome to Ed-tech your Ai Assistant,</p>
       <p class="name">Hi {{username}}!</p>
      <p class="p-1">We're thrilled to have you on board! You're now ready to log in, access personalized content, and begin enhancing your learning experience, train seamlessly in any role improve and get better.</p>
      <p class="p-1"><strong>{{email}}</strong></p>
      <p class="p-1">Feel free to login, explore our platform <br/> start improving right away!</p>
      <button class="button">
        Login to Ed-tech
       </button>
      <P class="team"><i>Happy Reading!</i></P>
      <p class="team"><i>The Ed-tech Team</i></p>
       
    </div>
    <div class="footer">
      &copy;2025 Ed-Tech. All rights reserved.
    </div>
  </div>
</div>
</body>
</html>

};`

module.exports = EMAIL_VERIFY_TEMPLATE