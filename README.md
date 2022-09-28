# buddyreads-backend

This app is currently in progress.

## Overview
BuddyReads is for friends that want buddy read a book. 
This app allows users to track their progress and share their thoughts along the way. 
Posts are connected to a page number and are hidden to others until they are past that page to prevent spoilers. 

## Accessing the App
[buddyreadsapp.surge.sh](https://buddyreadsapp.surge.sh/)<br/>
[Video walkthrough of my app](https://drive.google.com/file/d/1IeZdG1KzfSaW3YbKWjUGrzazyzwPOMbJ/view?usp=sharing)<br/><br/>
 Here are some test user emails (all passwords are 'password'):
* suebird@wnba.com
* candaceparker@wnba.com
* ajawilson@wnba.com 

## API
Book data is obtained from the [Google Books API](https://developers.google.com/books/docs/overview). 

## Database Schema
[Link to Database Schema](https://docs.google.com/document/d/1JqPRsHvKuJ91vt7trL-vy4u-rRYuRFveIsFFFs5njlM/edit?usp=sharing)

## Tech Stack
Node.js, Express, PostgreSQL

## Front End Repo
https://github.com/ohmilla/buddyreads-frontend

## Upcoming Features
* User friendly error messages for backend schema issues
* Confirm current password to change password
* Make Loading Spinner component an actual spinner
* Pagnation for BookSearch for more results
