const cron = require('cron');
const express = require('express');
const fs = require('fs');
const mail = require('nodemailer');
const shell = require('shelljs');
const twilio = require('twilio');

const app = express();
const PORT = 3000;

// SETUP
// CRONJOBS
// SERVER

const snap = () => {
  shell.exec('raspistill -vf -hf -o panopticat-$(date +%Y%m%d-%H%M%S).jpg', (code, stdout, stderr) => {
    console.log(code);
    console.log(stdout);
    console.log(stderr);
  });
};

snap();
