# api-monitor
The main idea of the task is to build an uptime monitoring RESTful API server which allows authorized users to enter URLs they want monitored, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

# Features
Sign-up with email verification.
Stateless authentication using JWT.
Users can create a check to monitor a given URL if it is up or down.
Users can edit, pause, or delete their checks if needed.
Users may receive a notification on a webhook URL by sending HTTP POST request whenever a check goes down or up.
Users should receive email alerts whenever a check goes down or up.
Users can get detailed uptime reports about their checks availability, average response time, and total uptime/downtime.
Users can group their checks by tags and get reports by tag.

# how-to-start
* Pull the project locally.
* Add your mail config and other needed env in docker-compose.yml.
* docker-compose up.
* You can play using the postman collection that you can found in the repo.

