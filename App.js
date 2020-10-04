import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Data = [
  {id: 1, color: 'red'},
  {id: 2, color: 'blue'},
  {id: 3, color: 'orange'},
  {id: 4, color: 'green'},
  {id: 5, color: 'yellow'},
  {id: 6, color: 'pink'},
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function App() {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({
          x: gesture.dx,
          y: gesture.dy,
        });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    }),
  ).current;
  useEffect(() => {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
    LayoutAnimation.spring();
  }, [index]);
  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      useNativeDriver: false,
      toValue: {x, y: 0},
      duration: SWIPE_OUT_DURATION,
    }).start(() => onSwipeComplete());
  };
  const onSwipeComplete = () => {
    position.setValue({x: 0, y: 0});
    setIndex((index) => index + 1);
  };
  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg'],
    });
    return {
      ...position.getLayout(),
      transform: [{rotate}],
    };
  };
  const resetPosition = () => {
    Animated.spring(position, {
      useNativeDriver: false,
      toValue: {x: 0, y: 0},
    }).start();
  };
  const renderCards = () => {
    if (index >= Data.length)
      return (
        <TouchableOpacity
          onPress={() => setIndex(0)}
          style={{alignSelf: 'center'}}>
          <Icon name="ios-refresh" size={30} color="#4F8EF7" />
        </TouchableOpacity>
      );
    return Data.map((data, position) => {
      if (position < index) return null;
      if (index === position)
        return (
          <Animated.View
            style={[
              getCardStyle(),
              {backgroundColor: data.color, zIndex: 99},
              styles.card,
            ]}
            key={data.id}
            {...panResponder.panHandlers}
          />
        );
      return (
        <Animated.View
          style={[
            {
              backgroundColor: data.color,
              zIndex: Math.ceil(Math.random() * 98),
            },
            styles.card,
          ]}
          key={data.id}
        />
      );
    });
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>{renderCards()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
  },
  card: {
    width: 320,
    marginHorizontal: (SCREEN_WIDTH - 320) / 2,
    height: 180,
    borderRadius: 20,
    position: 'absolute',
  },
});
