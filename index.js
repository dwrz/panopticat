const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const PORT = 3000;
const snap = () => {
  shell.exec('raspistill -vf -hf -o test.jpg', (code, stdout, stderr) => {
    console.log(code);
    console.log(stdout);
    console.log(stderr);
  });
};

snap();
