# CollabLive — Campus Discovery Trail

**Course:** COMP2140 — Web/Mobile Programming  
**Assessment:** React Native Project (A3)  
**Student:** Yiting Xiao  
**Student number:** 49096963  
**Theme:** CollabLive — Presentation Trail

## 1. Vision Statement

Campus Discovery Trail is a mobile learning application for students and visitors exploring the University of Queensland's St Lucia campus. Users explore three learning stops: Great Court, Duhig Tower and UQ Lakes. At each stop, they can unlock a short slide, read its learning activity and mark the stop as completed. Progress is saved locally so users can continue later and review completed content.

The application combines interactive maps with location-triggered content. The map helps users explore the campus and locate learning stops, while the phone's GPS position determines whether new content is available. These functionalities work together to connect learning with physical places. A simulation mode allows the complete experience to be tested without travelling. Simulation progress and real visit progress are stored separately.

## 2. Main Features

- Interactive map with three learning stops.
- Map markers and 80-metre proximity circles.
- Controls to focus on a stop, show all stops and show the user's position.
- Estimated straight-line distances to learning stops.
- Location-based access to new slides.
- A learning slide and activity at each stop.
- Completion tracking and a trail completion message.
- Local progress persistence using AsyncStorage.
- Separate progress for simulation and live GPS modes.
- Completed slides remain available for review outside the unlock radius.
- Simulation controls for testing without travelling.
- Location permission, GPS accuracy and stale-position feedback.
- Offline notice and continued access to bundled content and local progress.
- Navigation using Expo Router.

## 3. Technology and Testing Environment

| Item | Details |
| --- | --- |
| Programming language | TypeScript and TSX |
| Framework | React Native with Expo |
| Navigation | Expo Router |
| Maps | react-native-maps |
| Location | expo-location |
| Local persistence | @react-native-async-storage/async-storage |
| Network detection | @react-native-community/netinfo |
| Expo SDK | 57 |
| Expo package version | ~57.0.30 |
| Test device | Physical iPhone: [ENTER IPHONE MODEL] |
| iOS version | [ENTER IOS VERSION] |
| Test application | Expo Go |

This is a single-user experience. No login, user account, second device or course API setup is required.

The learning stops and slide content are bundled with the project. Progress is stored on the device rather than uploaded to a server.

## 4. Installation and Startup

1. Extract the submitted ZIP file.
2. Open the project folder in VS Code.
3. Open a terminal in the folder containing `package.json`.
4. Install the dependencies:

   ```bash
   npm install
   ```

5. Start the Expo development server:

   ```bash
   npx expo start --tunnel
   ```

   On Windows PowerShell, use:

   ```powershell
   npx.cmd expo start --tunnel
   ```

6. Install Expo Go on the iPhone.
7. Scan the terminal's QR code using the iPhone camera.
8. Open the project in Expo Go and wait for the home screen to load.
9. Tap **View trail** to open the trail screen.

Keep the development server running while testing.

An internet connection is needed to load the development project initially. Map tiles also require network access unless already cached.

## 5. Testing Guide

### 5.1 Home Screen and Navigation

1. Open the application.
2. Confirm that the home screen displays the Campus Discovery trail.
3. Find the **Your progress** panel.
4. Confirm that **Live trail** and **Simulation** are listed separately.
5. Tap **View trail**.
6. Confirm that the **Trail details** screen opens.
7. Use the **Home** back button to return to the home screen.

**Expected result:** Users can navigate between the home screen and the trail. The home screen displays separate progress for real visits and simulation.

### 5.2 Interactive Map

1. Open the trail.
2. Tap **Show all stops**.
3. Confirm that Great Court, Duhig Tower and UQ Lakes appear on the map.
4. Confirm that circles indicate the unlock areas.
5. Tap a stop marker.
6. Tap a stop card's title.

**Expected result:** The map focuses on the selected stop and its card is highlighted. Selecting a stop does not move the user's position or automatically unlock its content.

### 5.3 Location Unlocking Without Travelling

The trail starts in **Simulation mode**.

1. If simulation already has completed stops, tap **Reset this mode's progress**, then confirm **Reset**.
2. If progress is already empty, skip the reset step.
3. Tap **Outside all stops**.
4. Check the three stop cards.
5. Confirm that uncompleted slides display **Slide locked** and cannot be opened.
6. Tap **At stop 1**.
7. Find the Great Court card.
8. Confirm that its distance is **0 m** and its slide is available.
9. Tap **Read slide**.
10. Confirm that the learning content and activity are displayed.
11. Tap **Close slide**.

**Expected result:** Moving the simulated position inside a stop's radius enables access to its new learning content.

### 5.4 Complete the Trail

Start with empty simulation progress for this test.

1. Tap **At stop 1**.
2. Open Great Court's slide.
3. Tap **Mark as completed** and wait for saving to finish.
4. Confirm that progress becomes **1 / 3**, or **33%**.
5. Tap **At stop 2**.
6. Open Duhig Tower's slide and mark it completed.
7. Confirm that progress becomes **2 / 3**, or **67%**.
8. Tap **At stop 3**.
9. Open UQ Lakes' slide and mark it completed.
10. Confirm that progress becomes **3 / 3**, or **100%**.
11. Confirm that a trail completion message appears.
12. Tap **Outside all stops**.
13. Confirm that completed slides remain available for review.

**Expected result:** Users can complete the full learning journey. Completed content remains readable when they leave the stop.

### 5.5 Saved Progress

1. Complete at least one simulation stop.
2. Wait for saving to finish.
3. Return to the home screen.
4. Confirm that the **Simulation** count reflects the completed stops.
5. Open the trail again.
6. Confirm that the completed stops are retained.
7. While online and with the development server running, reload the project in Expo Go.
8. Open the trail and check the progress again.

**Expected result:** Progress survives screen navigation and a project reload.

### 5.6 Live GPS and Separate Progress

1. Open the trail.
2. Read the explanation of how location is used.
3. Tap **Use my location**.
4. Allow foreground location access when prompted.
5. Enable Precise Location for Expo Go when available.
6. Wait for the GPS status message.
7. When a position is available, tap **Show my position**.
8. Confirm that the map focuses on the GPS estimate.
9. Check the estimated distances to the stops.
10. Confirm that the progress panel identifies **Live trail progress**.
11. Tap an **At stop** control to return to simulation.
12. Confirm that simulation progress is retained separately.

**Expected result:** Real GPS controls live distances and proximity checks. Simulation completions do not increase live progress.

New slides in live mode require:

- An estimated distance of no more than **80 metres**.
- Reported GPS accuracy of **50 metres or better**.
- A location sample no more than **30 seconds old**.

These thresholds reduce the use of unreliable positions but do not guarantee exact physical location.

### 5.7 Location Permission and Background Handling

1. Switch to live GPS mode.
2. Tap **Open location settings**.
3. Deny location permission for Expo Go in iPhone Settings.
4. Return to the application.
5. Tap **Retry live location** if needed.
6. Confirm that the application explains the permission problem.
7. Use **At stop 1** to confirm that simulation still works.
8. Restore location permission in Settings.
9. Return and retry live location.
10. Switch to another application, then return to the trail.
11. Confirm that the application reacquires the position.

**Expected result:** Denied permission does not prevent simulation. Location monitoring stops when the trail loses focus or the app enters the background and restarts when appropriate.

If GPS takes too long, reports insufficient accuracy or stops updating, the application displays feedback and prevents unreliable positions from unlocking new content.

Environmental GPS conditions may not reproduce every error state during a single test.

### 5.8 Offline Behaviour

1. While online, fully load the application and open the trail.
2. Switch to simulation.
3. Leave at least one stop uncompleted, resetting simulation progress if needed.
4. Turn off both Wi-Fi and mobile data on the iPhone.
5. Return to the application.
6. Confirm that the yellow **You are offline** notice appears.
7. Use an **At stop** control.
8. Open the corresponding slide and mark it completed.
9. Wait for saving to finish.
10. Return to the home screen and reopen the trail.
11. Confirm that progress is retained.
12. Restore the network and return to the application.
13. Confirm that the offline notice disappears after the connection status updates.

**Expected result:** Simulation, bundled learning content and local progress remain usable without a connection. Map tiles may be unavailable.

Do not refresh or close Expo Go during this offline test. Reloading the development project requires a connection to the development server.

The project does not implement downloadable offline maps or synchronisation with a remote server.

### 5.9 Reset Progress

1. Select a mode with completed stops.
2. Tap **Reset this mode's progress**.
3. Choose **Cancel**.
4. Confirm that progress remains unchanged.
5. Open the confirmation again and choose **Reset**.
6. Confirm that the selected mode returns to **0 / 3**.
7. Switch modes and confirm that the other mode's progress is retained.

**Expected result:** Reset requires confirmation and clears only the selected mode.

## 6. Requirement Mapping

| Requirement | Implementation and test location |
| --- | --- |
| App design and navigation | Consistent home/trail screens and Expo Router navigation; Section 5.1 |
| Mobile-first experience | Campus exploration using the phone's position; Sections 5.3–5.7 |
| Advanced functionality: maps | Markers, proximity circles, destination selection and map controls; Section 5.2 |
| Advanced functionality: location and proximity | GPS position, distance calculations and location-based slide access; Sections 5.3 and 5.6 |
| Cohesive experience | Explore destinations, arrive, read content and record completion; Sections 5.2–5.5 |
| Data persistence | AsyncStorage with separate simulation/live progress; Sections 5.5 and 5.6 |
| Mobile context and error states | Permission explanation, GPS feedback, loading/saving messages, error feedback, retry controls and offline notice; Sections 5.7 and 5.8 |

Maps and location-triggered content are the two advanced functionalities claimed for this project.

Local saving, network detection and ordinary navigation support the experience but are not claimed as additional advanced functionalities.

## 7. Validation and Known Limitations

### Validation

- TypeScript checking completed without reported errors using `npx.cmd tsc --noEmit`.
- Expo Doctor reported **21/21 checks passed** during development.
- After the code corrections, lint reported **0 errors and 2 warnings**.
- The remaining warnings concern dependencies used to trigger location and progress-loading retries.
- Manual testing was performed on a physical iPhone using Expo Go.
- Simulation testing covered slide locking, arrival, reading, completion and progress display.
- Offline and location-permission behaviour were manually tested.

### Known Limitations

- Stop coordinates are reference positions. Real-world arrival and unlocking still require on-site validation.
- Distances are straight-line estimates rather than walking directions.
- GPS accuracy depends on permissions, device conditions and the surrounding environment.
- The map requires network access or previously cached tiles.
- Progress is stored on one device and is not synchronised across devices.
- Clearing application storage may remove saved progress.
- Storage failures were not deliberately injected. The application includes error feedback and loading retry controls.
- Successful simulation does not prove that every real-world GPS condition has been tested.

## 8. Privacy

Location is used to calculate distances and determine whether nearby content can be accessed.

The trail logic does not save or upload GPS history. Location monitoring stops when the screen is not focused or the application is in the background.

Users can decline location access and use simulation instead. Completion progress is stored locally.

The platform's map provider may make network requests to retrieve map data.

## 9. Generative AI Declaration

I used ChatGPT and Codex to assist with planning, understanding React Native and TypeScript, generating and revising code, debugging errors and preparing documentation.

AI assistance included substantial suggested code for:

- The home and trail interfaces.
- Map controls and simulated positions.
- Distance calculations and proximity-based unlocking.
- Location permissions, accuracy checks and location lifecycle handling.
- Local progress persistence.
- Network-status feedback.
- TypeScript and lint corrections.

Codex also assisted with the GitHub workflow. ChatGPT helped draft the README and testing instructions.

I copied and integrated suggested changes into the project and manually tested the application in Expo Go on my iPhone. This declaration includes code-generation assistance as well as explanations and debugging.

## 10. References and Acknowledgements

The project began with the open-source Expo starter template. The application's home and trail screens were developed for the Campus Discovery experience.

- Expo. (n.d.). *Expo documentation*. https://docs.expo.dev/
- Expo. (n.d.). *Expo Router introduction*. https://docs.expo.dev/router/introduction/
- Expo. (n.d.). *Location*. https://docs.expo.dev/versions/v57.0.0/sdk/location/
- Meta Open Source. (n.d.). *React Native documentation*. https://reactnative.dev/docs/getting-started
- React Team. (n.d.). *useSyncExternalStore*. https://react.dev/reference/react/useSyncExternalStore
- React Native Maps contributors. (n.d.). *react-native-maps* [Source code]. GitHub. https://github.com/react-native-maps/react-native-maps
- React Native NetInfo contributors. (n.d.). *react-native-netinfo* [Source code]. GitHub. https://github.com/react-native-netinfo/react-native-netinfo
- React Native Async Storage contributors. (n.d.). *AsyncStorage* [Source code]. GitHub. https://github.com/react-native-async-storage/async-storage

The learning slides are sample content prepared for this assessment and are not official UQ interpretive material.