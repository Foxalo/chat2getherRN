import React from 'react';
import {Animated, Easing, Dimensions} from 'react-native';
import styled from 'styled-components';
import {Svg, Path, G, Defs, LinearGradient, Stop} from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const StyledSVGTester = styled.View`
  flex-direction: row;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #000000aa;
  justify-content: center;
  align-items: center;
`;
const ClippingCircle = styled.View`
  background-color: #00000022;
  overflow: hidden;
  border-radius: 500px;
  height: ${props => (props.length ? `${props.length}px` : '100%')};
  width: ${props => (props.length ? `${props.length}px` : '100%')};
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const rotationChat = new Animated.Value(0);
const opacity = new Animated.Value(0);
const waves = new Animated.Value(0);
const width = 100;

export default function SVGTester(props) {
  const {length} = props;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotationChat, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.12, 1.01, 0.82, 0),
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(opacity, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(waves, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.51, 0.7, 0.61, 0.43),
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <StyledSVGTester length={length}>
      <ClippingCircle length={length}>
        <Svg viewBox="0 0 100 100" height="120%" width="120%">
          <Defs>
            <LinearGradient id="a" x1="1" x2="1" y1="1" y2="-1.5">
              <Stop offset="20%" stopColor="#9932cc" />
              <Stop offset="60%" stopColor="#fff" />
            </LinearGradient>
          </Defs>
          <G
            fill="#9932cc"
            strokeWidth="3.088"
            fontFamily="Microsoft YaHei"
            fontWeight="400"
            letterSpacing="0"
            wordSpacing="0">
            <G aria-label="CHAT2GETHER" fontSize="101.726" transform={`translate(${width}, ${width})`}>
              <AnimatedPath
                id="chat"
                style={{
                  opacity: opacity.interpolate({
                    inputRange: [0, 0.01, 0.49, 0.5, 1],
                    outputRange: [0, 1, 1, 0, 0],
                  }),
                  transform: [
                    {translateX: -width / 2},
                    {translateY: -width / 2},
                    {
                      rotate: rotationChat.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-180deg', '180deg'],
                      }),
                    },
                    {translateX: -width / 2},
                    {translateY: -width / 2},
                  ],
                }}
                d="M19.778 39.432q.232 1.146-.206 2.645-.566 1.935-2.13 2.732-1.57.796-3.591.205-2.173-.636-3.117-2.325-.944-1.688-.357-3.692.377-1.29.99-2.025l1.213.355q-.816.808-1.154 1.964-.44 1.504.288 2.745.722 1.24 2.424 1.737 1.615.473 2.826-.132 1.205-.606 1.623-2.035.39-1.336.076-2.5zM24.762 31.722l-.648 1.023-3.57-2.26-2.538 4.01 3.57 2.259-.648 1.023-7.921-5.015.647-1.023 3.442 2.179 2.538-4.01-3.441-2.178.647-1.023zM31.94 25.03l-1.005.884-2.413-1.296-2.932 2.579 1.018 2.522-1.004.884-3.51-9.399.972-.855zm-4.4-.96l-3.637-1.99q-.174-.098-.54-.396l-.023.02q.23.362.318.591l1.52 3.854zM34.44 14.47l-2.404 1.24 3.802 7.376-1.081.557-3.803-7.375-2.394 1.234-.493-.958 5.88-3.031zM41.76 13.729q-.19-.733-.76-1.03-.571-.303-1.368-.098-.563.145-1.064.58-.5.435-.861 1.097l-.287-1.114q.327-.578.826-.969.505-.392 1.267-.588 1.231-.317 2.152.152.92.464 1.209 1.59.258 1.002-.017 1.853-.269.85-1.185 1.905-.935 1.078-1.234 1.518-.294.438-.366.788-.073.35.042.795l4.513-1.161.263 1.02-5.71 1.469-.116-.452q-.202-.785-.131-1.385.075-.606.435-1.249.358-.648 1.214-1.644.874-1.024 1.116-1.687.247-.67.061-1.39zM53.849 19.186q-1.41.79-3.177.78-2.033-.013-3.272-1.304-1.233-1.297-1.22-3.446.014-2.172 1.396-3.562 1.383-1.39 3.532-1.376 1.519.009 2.569.5l-.008 1.307q-1.122-.715-2.677-.725-1.531-.01-2.53 1.032-1 1.04-1.01 2.754-.011 1.76.897 2.747.908.986 2.463.996 1.072.006 1.825-.4l.015-2.536-2.033-.013.006-1.071 3.25.02zM60.844 21.56l-4.88-1.268 2.358-9.074 4.675 1.215-.271 1.043-3.503-.91-.755 2.905 3.245.843-.27 1.037-3.245-.843-.793 3.052 3.708.963zM71.33 17.434l-2.41-1.23-3.773 7.39-1.084-.553 3.774-7.39-2.4-1.225.49-.96 5.893 3.008zM74.125 30.437l-.9-.81 2.828-3.14-3.526-3.175-2.827 3.14-.9-.81 6.274-6.968.9.81-2.726 3.027 3.526 3.176L79.5 22.66l.9.81zM78.363 36.614l-2.776-4.208 7.826-5.163 2.66 4.032-.9.593-1.993-3.021-2.506 1.653 1.847 2.799-.895.59-1.846-2.8-2.632 1.737 2.11 3.199zM81.535 44.654l-.492-1.34 1.908-2.357q.573-.707.7-1.166.134-.462-.051-.968l-.3-.818-3.705 1.359-.417-1.137L87.98 35l.984 2.682q.47 1.285.118 2.24-.352.954-1.466 1.362-1.83.671-3.092-1.084l-.029.01q-.02.42-.208.786-.186.372-.72 1.044zm5.868-8.154l-3.109 1.14.492 1.341q.286.779.917 1.095.634.322 1.373.051.687-.252.911-.837.224-.585-.086-1.432z"
              />
            </G>
            <G aria-label="LOADING" fontSize="101.727" transform={`translate(${width}, ${width})`}>
              <AnimatedPath
                id="loading"
                style={{
                  opacity: opacity.interpolate({
                    inputRange: [0, 0.5, 0.52, 0.99, 1],
                    outputRange: [0, 0, 1, 1, 0.5],
                  }),
                  transform: [
                    {translateX: -width / 2},
                    {translateY: -width / 2},
                    {
                      rotate: rotationChat.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                    {translateX: -width / 2},
                    {translateY: -width / 2},
                  ],
                }}
                d="M71.003 73.582l3.553-3.44 6.521 6.737-.87.842-5.776-5.966-2.683 2.597zM72.673 78.236q1.112 1.98.699 3.753-.413 1.773-2.245 2.802-1.704.957-3.387.396-1.683-.56-2.715-2.397-1.117-1.99-.707-3.754.411-1.766 2.195-2.768 1.741-.978 3.435-.423 1.693.555 2.725 2.391zm-1.061.707q-.833-1.482-2.092-1.955-1.26-.465-2.48.22-1.308.735-1.572 2.008-.266 1.28.6 2.822.89 1.583 2.106 2.03 1.211.452 2.483-.263 1.25-.702 1.516-2.046.266-1.343-.561-2.816zM53.684 80.681l1.306-.29 1.49 2.298 3.811-.846.324-2.7 1.306-.29-1.454 9.926-1.265.281zm3.392 2.961l2.227 3.498q.106.17.284.607l.03-.006q-.028-.428.005-.671l.526-4.11zM52.284 80.69l-.59 9.358-2.67-.169q-2.126-.134-3.455-1.46-1.336-1.328-1.204-3.412.137-2.175 1.633-3.397 1.49-1.222 3.713-1.081zm-1.73 8.206l.455-7.212-1.36-.086q-1.781-.112-2.84.797-1.063.91-1.174 2.662-.11 1.751.861 2.698.971.947 2.645 1.052zM39.287 88.285l2.472-9.044 1.168.32-2.473 9.043zM32.56 75.116l1.272.665.797 8.648q.034.366.001.69l.032.018q.103-.302.566-1.187l3.056-5.84 1.061.555L35 86.973l-1.346-.704-.744-8.477q-.054-.602-.043-.753l-.022-.012q-.131.382-.58 1.24l-2.988 5.712-1.062-.555zM25.13 69.074q1.56.421 2.815 1.666 1.445 1.431 1.427 3.22-.026 1.79-1.54 3.316-1.529 1.543-3.489 1.569-1.96.025-3.486-1.487-1.079-1.07-1.486-2.155l.92-.929q.301 1.296 1.406 2.39 1.088 1.079 2.53 1.034 1.442-.045 2.648-1.261 1.24-1.251 1.281-2.591.041-1.34-1.064-2.435-.76-.754-1.583-.99l-1.786 1.8 1.445 1.433-.754.76-2.309-2.288z"
              />
            </G>
          </G>
          <AnimatedPath
            id="waves"
            fill="url(#a)"
            scale={1.5}
            y={-35}
            d="M-3049.95-717.214a8.559 8.05 0 0 1-8.194 5.735 8.559 8.05 0 0 1-4.28-1.088v38.548h90.478v-38.55a8.559 8.05 0 0 1-4.28 1.09 8.559 8.05 0 0 1-8.19-5.735 8.559 8.05 0 0 1-8.193 5.735 8.559 8.05 0 0 1-8.19-5.735 8.559 8.05 0 0 1-8.194 5.735 8.559 8.05 0 0 1-8.19-5.735 8.559 8.05 0 0 1-8.194 5.735 8.559 8.05 0 0 1-8.19-5.735 8.559 8.05 0 0 1-8.193 5.735 8.559 8.05 0 0 1-8.19-5.735z"
            transform="translate(3067.185 774.02)"
            style={{
              transform: [
                {
                  translateX: waves.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, -8],
                  }),
                },
              ],
            }}
          />
        </Svg>
      </ClippingCircle>
    </StyledSVGTester>
  );
}

SVGTester.defaultProps = {
  length: Dimensions.get('screen').width - 50,
};
