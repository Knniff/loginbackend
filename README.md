CI: [![Build Status](https://travis-ci.org/Knniff/loginbackend.svg?branch=master)](https://travis-ci.org/Knniff/loginbackend)
Coverage: [![Coverage Status](https://coveralls.io/repos/github/Knniff/loginbackend/badge.svg?branch=master)](https://coveralls.io/github/Knniff/loginbackend?branch=master)

# leaguebackend

When testing, drops the database named in the .env file!

Populate your .env file and then run:
docker run -it -p 4000:4000 --env-file .env loginbackend:1.3
for a dockerized version
