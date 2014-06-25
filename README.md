Is My Site Up?
==============

A simple node process, just clone this on to your server. Update the .env file
and watch as your site get monitored like a pro. You can choose to be notified
via text or email. You can also adjust the timing of the site checks.

How it works?
-------------

The app is very simple. It runs a node process with forever and polls your
website at a predetermined interval. If it's unable to connect/doesn't receive
a status code in the 200s or 300s it will alert you that your website
is unavailable.

Setup and Installation
----------------------

1. Download and install the IsMySiteUp repo.
2. Create a **.env** file in the site root, or rename the .env_example file to **.env**.
3. Modify the .env file with your settings.
4. Run the node process (instructions below)

Example .env File
-----------------

Within your env file you can configure several characteristics of the monitoring process.
```
DEV_ENV=local # an environmental variable (can be used for modifying the setup)
PORT=5050 # not really important, but this setup could host a web page
NOTIFICATION_METHOD=email # for now, the only option here is email, but I'm hoping to add text message support soon
POLLING_INTERVAL=5 # how many seconds should we wait between calls to the server (polling)
NOTIFICATION_INTERVAL=20 # how many minutes should we wait before we notify you again?
TOLERANCE=5 # how many times should we get an error before we alert you?
PROTOCOL=http # either http or https
GMAIL_PHRASE=YOUR_GMAIL_PASSWORD # your gmail password
```

Running the Process
-------------------

You can always run the process temporarily on you local or staging environment with foreman:

```
cd /PATH/TO/SERVER/
foreman start
```

Or you can run it with forever (NOTE: the -s is for "silent" so it won't log anything):

```
cd /PATH/TO/SERVER/
env $(cat .env) forever start -s poll.js
```

Or plain vanilla node:

```
env $(cat .env) node poll.js
```