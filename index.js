const { RingApi } = require('ring-client-api'),
      { exec }    = require('child_process');

async function subscribeToCameras() {
  const ringApi = new RingApi({
        refreshToken: "XXXXXXX",
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