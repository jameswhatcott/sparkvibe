import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioPlayer,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Recording() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<{ uri: string; timestamp: Date }[]>([]);
  
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  
  // Create audio player for the most recent recording
  const player = useAudioPlayer(recordedUri);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        setHasPermission(status.granted);
        
        if (!status.granted) {
          Alert.alert('Permission Required', 'Microphone permission is required to record audio.');
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
        
        setIsReady(true);
      } catch (error) {
        console.error('Error setting up audio:', error);
        Alert.alert('Error', 'Failed to initialize audio recording.');
      }
    })();
  }, []);

  const record = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      
      if (uri) {
        console.log('Recording saved at:', uri);
        setRecordedUri(uri);
        
        // Add to recordings list
        const newRecording = {
          uri: uri,
          timestamp: new Date()
        };
        setRecordings(prev => [...prev, newRecording]);
        
        Alert.alert('Success', 'Recording saved successfully!');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const playRecording = async (uri: string) => {
    try {
      setRecordedUri(uri);
      await player.play();
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const pausePlayback = async () => {
    try {
      await player.pause();
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      await player.stop();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const seekTo = async (seconds: number) => {
    try {
      await player.seekTo(seconds);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const deleteRecording = (uri: string) => {
    setRecordings(prev => prev.filter(recording => recording.uri !== uri));
    if (recordedUri === uri) {
      setRecordedUri(null);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting microphone permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to microphone</Text>
        <Button title="Grant Permission" onPress={() => AudioModule.requestRecordingPermissionsAsync()} />
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text>Setting up audio...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Voice Recorder</Text>
        
        {/* Recording Controls */}
        <View style={styles.recordingSection}>
          <Text style={styles.sectionTitle}>Record New Audio</Text>
          <Button
            title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
            onPress={recorderState.isRecording ? stopRecording : record}
          />
          {recorderState.isRecording && (
            <Text style={styles.status}>Recording...</Text>
          )}
        </View>

        {/* Playback Controls for Current Recording */}
        {recordedUri && (
          <View style={styles.playbackSection}>
            <Text style={styles.sectionTitle}>Playback Controls</Text>
            <View style={styles.buttonRow}>
              <Button title="Play" onPress={() => playRecording(recordedUri)} />
              <Button title="Pause" onPress={pausePlayback} />
              <Button title="Stop" onPress={stopPlayback} />
            </View>
            <View style={styles.buttonRow}>
              <Button title="Seek to 0s" onPress={() => seekTo(0)} />
              <Button title="Seek to 10s" onPress={() => seekTo(10)} />
            </View>
            <Text style={styles.uriText}>URI: {recordedUri}</Text>
          </View>
        )}

        {/* Recordings List */}
        {recordings.length > 0 && (
          <View style={styles.recordingsSection}>
            <Text style={styles.sectionTitle}>Saved Recordings</Text>
            {recordings.map((recording, index) => (
              <View key={recording.uri} style={styles.recordingItem}>
                <Text style={styles.recordingText}>
                  Recording {index + 1} - {recording.timestamp.toLocaleTimeString()}
                </Text>
                <View style={styles.recordingButtons}>
                  <Button 
                    title="Play" 
                    onPress={() => playRecording(recording.uri)}
                  />
                  <Button 
                    title="Delete" 
                    onPress={() => deleteRecording(recording.uri)}
                    color="red"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  recordingSection: {
    marginBottom: 20,
  },
  playbackSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  recordingsSection: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  status: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  uriText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  recordingItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  recordingText: {
    fontSize: 16,
    marginBottom: 10,
  },
  recordingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
