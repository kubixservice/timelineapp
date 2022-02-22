/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  useColorScheme,
  Switch,
  View,
} from 'react-native';

import BackgroundGeolocation, {
  Subscription,
  Coords,
} from 'react-native-background-geolocation';
import MapView, {Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  itemRowTitle: {
    color: 'white',
    fontSize: 20,
  },
});

const App: React.FC = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [locationHistory, setLocationHistory] = React.useState<Coords[]>([]);
  const [polygon, setPolygon] = React.useState([]);

  React.useEffect(() => {
    fetch(
      'https://nominatim.openstreetmap.org/search.php?q=Uzhgorod&polygon_geojson=1&format=json',
    )
      .then(res => res.json())
      .then(json => {
        console.log(JSON.stringify(json[0].geojson.coordinates[0], null, 4));
        setPolygon(
          json[0].geojson.coordinates[0].map(i => ({
            longitude: i[0],
            latitude: i[1],
          })),
        );
      });
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      setLocationHistory([]);
    }
  }, [enabled]);

  React.useEffect(() => {
    /// 1.  Subscribe to events.
    const onLocation: Subscription = BackgroundGeolocation.onLocation(loc => {
      console.log('[onLocation]', loc);
      // setLocation(JSON.stringify(loc, null, 2));
      if (loc.coords) {
        setLocationHistory(prev => [...prev, loc.coords]);
      }
    });

    const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange(
      event => {
        console.log('[onMotionChange]', event);
      },
    );

    const onActivityChange: Subscription =
      BackgroundGeolocation.onActivityChange(event => {
        console.log('[onMotionChange]', event);
      });

    const onProviderChange: Subscription =
      BackgroundGeolocation.onProviderChange(event => {
        console.log('[onProviderChange]', event);
      });

    /// 2. ready the plugin.
    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 5,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
      locationAuthorizationRequest: 'Always',
    }).then(state => {
      setEnabled(state.enabled);
      console.log(
        '- BackgroundGeolocation is configured and ready: ',
        state.enabled,
      );
    });

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onLocation.remove();
      onMotionChange.remove();
      onActivityChange.remove();
      onProviderChange.remove();
    };
  }, []);

  /// 3. start / stop BackgroundGeolocation
  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
    }
  }, [enabled]);
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.flex}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.flex}
        showsUserLocation
        showsMyLocationButton>
        <Polygon coordinates={polygon} />
        {locationHistory.map((i, idx) => (
          <Marker
            key={idx}
            coordinate={{latitude: i.latitude, longitude: i.longitude}}
          />
        ))}
      </MapView>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.row}>
          <Text style={styles.itemRowTitle}>Enable BackgroundGeolocation</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default App;
