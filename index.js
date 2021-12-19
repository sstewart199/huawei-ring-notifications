const { RingApi } = require('ring-client-api'),
      { exec }    = require('child_process');

async function subscribeToCameras() {
  const ringApi = new RingApi({
        refreshToken: "eyJhbGciOiJIUzUxMiIsImprdSI6Ii9vYXV0aC9pbnRlcm5hbC9qd2tzIiwia2lkIjoiYzEyODEwMGIiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE2Mzk5MzUwNzAsImlzcyI6IlJpbmdPYXV0aFNlcnZpY2UtcHJvZDp1cy1lYXN0LTE6NTE5ODM4ODAiLCJyZWZyZXNoX2NpZCI6InJpbmdfb2ZmaWNpYWxfYW5kcm9pZCIsInJlZnJlc2hfc2NvcGVzIjpbImNsaWVudCJdLCJyZWZyZXNoX3VzZXJfaWQiOjQwNzQ4MTM0LCJybmQiOiI0UHdrTE85RFktYW9NQSIsInNlc3Npb25faWQiOiI2YjA1MTE0ZC0xMjUwLTQzOTUtOGQwMC1iY2VhMDE1MDZhYmMiLCJ0eXBlIjoicmVmcmVzaC10b2tlbiJ9.2i8ri3CWEKeYLcHp8kPtg_jsBSp6UUJzl0dKykhrH89ghJolZ52eI8K-8-U5UmqJWhrfoT3SMbBKodTUvz2wyA",
        // The following are all optional. See below for details
        cameraStatusPollingSeconds: 20,
        cameraDingsPollingSeconds: 2,
    debug: true,
  }),
  locations = await ringApi.getLocations(),
  allCameras = await ringApi.getCameras()

  console.log(
    `Found ${locations.length} location(s) with ${allCameras.length} camera(s).`
  )

  if (allCameras.length) {
    allCameras.forEach((camera) => {
      camera.onNewDing.subscribe((ding) => {
        const event =
          ding.kind === 'motion'
            ? 'Motion detected'
            : ding.kind === 'ding'
            ? 'Doorbell pressed'
            : `Video started (${ding.kind})`

        doAlert(event, camera, ding);
      })
    })

    console.log('Listening for motion and doorbell presses on your cameras.')
  }
};

function doAlert(event, camera, ding) {
  console.log(
    `${event} on ${camera.name} camera. Ding id ${
      ding.id_str
    }.  Received at ${new Date()}`
  );
  const notification = `"${event} on ${camera.name} camera. Received at ${new Date()}"`;
  const macCmd = `osascript -e 'display notification ${notification}'`;
  const huaweiCmd = `termux-notification --content ${notification} -t "Ring Camera" --vibrate 500 --button1 "View camera" --button1-action "am start --user 0 -n com.ring.answer/com.ring.answer.presentation.splash.SplashActivity"`;

  // check if running from mac and change the command
  const commandLine = process.platform == "darwin" ? macCmd : huaweiCmd;

  exec(commandLine, (error, stderr) => {
    if(error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if(stderr) {
      console.log(`stderr: ${stderr}`);
    }
  });
};


subscribeToCameras();