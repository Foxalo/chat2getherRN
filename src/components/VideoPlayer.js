import React from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components';
import Video from 'react-native-video';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {EntrancePortal} from '@cala/react-portal';
import HtmlParse from '../helpers/htmlParse';
import {useNotify} from '../hooks/NotifyContext';
import {useEnabledWidgets} from '../hooks/EnabledWidgetsContext';
import VideoGrid from './VideoGrid';

const StyledVideoPlayer = styled.View`
  background-color: ${props => props.theme.colorGreyDark3};
  display: ${props => (props.active ? 'flex' : 'none')};
  flex: 1;
  width: 100%;
`;
const VideoContainer = styled.View`
  /* filter: ${props => props.disabled && 'brightness(40%)'}; */
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;
`;
const EmptyStateText = styled.Text`
  font-size: 20px;
  text-align: center;
  color: #fff;
`;
const SearchButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  left: 10px;
  box-shadow: 0 0 4px;
  padding: 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => props.theme.colorGreyDark1};
  background-color: ${props => props.theme.colorGreyDark2};
`;
const SyncButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  left: 60px;
  box-shadow: 0 0 4px;
  border-width: 1px;
  border-color: ${props => props.theme.colorGreyDark1};
  background-color: ${props => props.theme.colorGreyDark2};
  padding: 10.5px;
  border-radius: 8px;
`;

const SyncText = styled.Text`
  font-size: 16px;
  color: ${props => props.color};
`;

const SYNC = {OFF: 'off', REQUESTED: 'requested', UNACCEPTED: 'unaccepted', ACCEPTED: 'accepted'};
const UPDATE = {PAUSE: 'pause', PLAY: 'play', SEEKED: 'seeked'};

/** ******************* Component Starts */
export default function VideoPlayer(props) {
  const {socketHelper, roomId, userId} = props;
  const [currentVideo, setCurrentVideo] = React.useState(null);
  const [isShown, setIsShown] = React.useState(false);
  const [parser, setParser] = React.useState(new HtmlParse(null));
  const [syncState, setSyncState] = React.useState(SYNC.OFF);
  const [videoUrl, setVideoUrl] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const player = React.useRef();

  /** For self implementation of pause/play tracking */
  const prevMillis = React.useRef();
  const prevPlayerTime = React.useRef();
  const curState = React.useRef();
  const probablyPlaying = React.useRef(0);
  const probablyPaused = React.useRef(0);

  const {enabledWidgets} = useEnabledWidgets();
  const active = enabledWidgets.video;
  const {videoNotify, setVideoNotify} = useNotify();

  // When user presses search
  const onSubmitSearch = async newQuery => {
    if (!newQuery || (parser && newQuery === parser.search)) return;
    const newParser = new HtmlParse(newQuery);
    await newParser.parsePage();
    setParser(newParser);
  };

  // Boilerplate socket message
  const msg = {
    roomId,
    userId,
  };

  // Selecting local video from grid
  const selectVideo = async videoId => {
    const newVideoUrl = await HtmlParse.getUrl(videoId);
    setVideoUrl(newVideoUrl);
    setCurrentVideo(videoId);
    setDisabled(false);
    console.log(`set videoUrl to ${newVideoUrl}`);
    if (syncState === SYNC.ACCEPTED) {
      msg.videoId = videoId;
      msg.videoUrl = newVideoUrl;
      msg.type = 'setVideo';
      socketHelper.emit('videoPlayerSync', msg);
    }
  };

  // Changing sync state when remote user clicks sync button
  const receiveSyncMsg = newMsg => {
    if (newMsg.userId === userId) return;
    let newState = syncState;
    // Handle other user toggling on sync
    if (newMsg.type === 'start') {
      if (syncState === SYNC.OFF) {
        newState = SYNC.UNACCEPTED;
      } else if (syncState === SYNC.REQUESTED) {
        newState = SYNC.ACCEPTED;
        socketHelper.emit('videoPlayerSync', {
          ...msg,
          videoId: currentVideo,
          videoUrl,
          currentTime: player.current && player.current.currentTime,
          type: 'setVideo',
        });
      }
      // Handle other user toggling off sync
    } else if (newMsg.type === 'stop') {
      if (syncState === SYNC.UNACCEPTED) {
        newState = SYNC.OFF;
      } else if (syncState === SYNC.ACCEPTED) {
        newState = SYNC.REQUESTED;
      }
      // Handle other user changing the video
    } else if (newMsg.type === 'setVideo' && syncState === SYNC.ACCEPTED) {
      if (!active) setVideoNotify(true);
      if (!newMsg.videoId) return;
      setCurrentVideo(newMsg.videoId);
      setVideoUrl(newMsg.videoUrl);
      if (player.current && newMsg.currentTime) {
        player.current.seek(parseFloat(newMsg.currentTime));
      }
    }
    // Notify if state was changed
    if (syncState !== newState && !active) {
      setVideoNotify(true);
    }
    setSyncState(newState);
  };

  // Changing local player when remote user updates player
  const receiveUpdateMsg = newMsg => {
    if (!player.current || newMsg.userId === userId || syncState !== SYNC.ACCEPTED) return;
    // If other user paused the video
    if (newMsg.type === UPDATE.PAUSE) {
      setPaused(true);
      curState.current = UPDATE.PAUSE;
      player.current.seek(newMsg.currentTime);
    } else if (newMsg.type === UPDATE.PLAY) {
      setPaused(false);
      curState.current = UPDATE.PLAY;
      player.current.seek(newMsg.currentTime);
    } else if (newMsg.type === UPDATE.SEEKED) {
      player.current.seek(newMsg.currentTime);
    } else return;
    setDisabled(true);
  };

  // Callback not supported by react-native-video

  // const handlePlaybackRateChange = playbackRate => {
  //   console.log(`Playing: ${playbackRate} and disabled: ${disabled}`);
  //   if (disabled) {
  //     setDisabled(false);
  //     return;
  //   }
  //   msg.type = playbackRate ? UPDATE.PLAY : UPDATE.PAUSE;
  //   msg.currentTime = prevPlayerTime.current;
  //   socketHelper.emit('videoPlayerUpdate', msg);
  // };

  // Will need to use until react-native-video supports onPlay/onPause callbacks
  // https://github.com/react-native-community/react-native-video/issues/1879
  const handleProgress = progress => {
    const {currentTime} = progress;
    const currentMillis = Date.now();
    // worldDelta is Date.now() - prevMillis - should be positive time like 300
    const worldDeltaSeconds = (currentMillis - prevMillis.current) / 1000;
    // playerDelta is currentTime - prevPlayerTime - will be 300 if playing, negative if seeking backwards, 0 if stopped
    const playerDeltaSeconds = currentTime - prevPlayerTime.current;
    const timeUnplayed = Math.abs(worldDeltaSeconds - playerDeltaSeconds);
    // In ideal world, would be 0 if playing
    if (timeUnplayed < 0.1) {
      probablyPlaying.current = probablyPlaying.current + 1;
      probablyPaused.current = 0;
    }
    // In ideal world, timeUnplayed would equal worldDeltaSeconds
    else if (timeUnplayed < worldDeltaSeconds + 0.1) {
      probablyPaused.current = probablyPaused.current + 1;
      probablyPlaying.current = 0;
    } else {
      probablyPaused.current = 0;
      probablyPlaying.current = 0;
    }

    // Need separate variable tracking curState to keep track of when our state changes
    if (curState.current !== UPDATE.PLAY && probablyPlaying.current === 4) {
      curState.current = UPDATE.PLAY;
      // Send socket msg
      if (!disabled) {
        msg.type = UPDATE.PLAY;
        msg.currentTime = currentTime;
        socketHelper.emit('videoPlayerUpdate', msg);
        console.log('PLAYING');
      }
      setDisabled(false);
    } else if (curState.current !== UPDATE.PAUSE && probablyPaused.current === 4) {
      curState.current = UPDATE.PAUSE;
      if (!disabled) {
        msg.type = UPDATE.PAUSE;
        msg.currentTime = currentTime;
        socketHelper.emit('videoPlayerUpdate', msg);
        console.log('PAUSED');
      }
      setDisabled(false);
    }
    // Cache time values
    prevMillis.current = currentMillis;
    prevPlayerTime.current = currentTime;
  };

  const handleSeek = ({currentTime}) => {
    if (disabled) {
      setDisabled(false);
      return;
    }
    msg.type = UPDATE.SEEKED;
    msg.currentTime = currentTime;
    socketHelper.emit('videoPlayerUpdate', msg);
  };

  // Setting listeners for Sync and Update socket requests
  React.useEffect(() => {
    if (!socketHelper) return;
    socketHelper.socket.on('videoPlayerSync', receiveSyncMsg);
    socketHelper.socket.on('videoPlayerUpdate', receiveUpdateMsg);
    return () => {
      socketHelper.socket.off('videoPlayerSync');
      socketHelper.socket.off('videoPlayerUpdate');
    };
  }, [socketHelper, currentVideo, syncState, active]);

  // Clearing the notify when player is made active
  React.useEffect(() => {
    if (videoNotify && active) {
      setVideoNotify(false);
    }
  }, [active]);

  // Clicking the player's toggle sync button
  const toggleSync = () => {
    let newState = syncState;
    if (syncState === SYNC.OFF) {
      newState = SYNC.REQUESTED;
    } else if (syncState === SYNC.REQUESTED) {
      newState = SYNC.OFF;
    } else if (syncState === SYNC.UNACCEPTED) {
      newState = SYNC.ACCEPTED;
    } else if (syncState === SYNC.ACCEPTED) {
      newState = SYNC.UNACCEPTED;
    }
    setSyncState(newState);
    if (syncState === SYNC.OFF || syncState === SYNC.UNACCEPTED) {
      msg.type = 'start';
    } else {
      msg.type = 'stop';
    }
    socketHelper.emit('videoPlayerSync', msg);
  };

  // Color for the sync button
  const syncColor = React.useMemo(() => {
    if (syncState === SYNC.OFF) return '#fff';
    if (syncState === SYNC.ACCEPTED) return 'green';
    return '#ffe400';
  }, [syncState]);

  const getSyncText = React.useCallback(() => {
    if (syncState === SYNC.OFF) return 'Request Sync';
    if (syncState === SYNC.REQUESTED) return 'Cancel Sync';
    if (syncState === SYNC.UNACCEPTED) return 'Accept Sync';
    return 'Synced';
  }, [syncState]);

  const height = Dimensions.get('window').width > Dimensions.get('window').height ? 'auto' : '100%';

  // const testUrl = 'https://ia800501.us.archive.org/10/items/BigBuckBunny_310/big_buck_bunny_640_512kb.mp4';
  return (
    <>
      <StyledVideoPlayer active={active} pointerEvents="box-none">
        <VideoContainer disabled={disabled} height={height} pointerEvents={disabled ? 'none' : 'box-none'}>
          {currentVideo ? (
            <Video
              key={currentVideo}
              style={{
                width: '100%',
                height: 300,
              }}
              // paused={paused}
              rate={paused ? 0 : 1}
              ref={player}
              playWhenInactive
              onPlaybackRateChange={() => console.log('playback change')}
              onSeek={handleSeek}
              onProgress={handleProgress}
              source={{uri: videoUrl}}
              resizeMode="contain"
              controls
              disableFocus
              playsInline
              fullScreen={false}
            />
          ) : (
            <EmptyStateText>Click the search and sync buttons in the top left!</EmptyStateText>
          )}
        </VideoContainer>
        <SearchButton onPress={() => setIsShown(true)}>
          <FontAwesomeIcon icon={faSearch} color="#fff" />
        </SearchButton>
        <SyncButton onPress={toggleSync}>
          <SyncText color={syncColor}>{getSyncText()}</SyncText>
        </SyncButton>
      </StyledVideoPlayer>
      <EntrancePortal name="fullscreen">
        <VideoGrid
          videos={parser.videos}
          onSubmitSearch={onSubmitSearch}
          isShown={active && isShown}
          setIsShown={setIsShown}
          selectVideo={selectVideo}
        />
      </EntrancePortal>
    </>
  );
}
