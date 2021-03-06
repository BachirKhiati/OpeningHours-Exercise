import React, { useState, useEffect } from 'react';
import {
    View,
    Dimensions,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar,
    Text,
    ActivityIndicator
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
    bInterpolate,
    bInterpolateColor,
    useTransition
} from 'react-native-redash';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import I18n from 'react-native-i18n';

import Chevron from './Components/Chevron';
import { Convert, NewDatesObjectType } from './Utils/Conversion';
import Item from './Components/Item';
import styles from './Styles/AppStyles';
import Colors from './Styles/Colors';
import { INITIAL_LANG } from './I18n/I18n';
import { jsonInput } from './Utils/Input';

const { width: WIDTH } = Dimensions.get('window');
// width when view minimized
const MIN_WIDTH = WIDTH * 0.6;
// width when view maximized
const MAX_WIDTH = WIDTH * 0.8;
// Top Interpolation value used when maximizing the view
const TOP_INT = 2 / WIDTH;

// initial btn/view  height- minimized
const BTN_HEIGHT = 60;

// List height when view is maximized
const LIST_HEIGHT = WIDTH - BTN_HEIGHT;

// loop  for switching language
interface LanguageTypes {
    [name: string]: string;
}
const LOOP_LANGUAGE: LanguageTypes = {
    fi: 'en',
    en: 'fi'
};

// to be able to transition the Icon(font) color between white to black.
const AnimatedIcon = Animated.createAnimatedComponent(Icon);

function App(): JSX.Element {
    // state
    const [showHours, setShowHours] = useState(false);
    const [list, setList] = useState<Array<NewDatesObjectType>>([]);
    const [language, setLanguage] = useState(INITIAL_LANG);

    // main transition
    const mainTransition = useTransition(showHours);

    // interpolations all based on "showHours" value"
    // Visual Effects
    const heightContainerInterpolate = bInterpolate(
        mainTransition,
        BTN_HEIGHT,
        WIDTH
    );
    const heightListInterpolate = bInterpolate(mainTransition, 0, LIST_HEIGHT);
    const heightListOpacity = bInterpolate(mainTransition, 0, 1);
    const widthInterpolate = bInterpolate(mainTransition, MIN_WIDTH, MAX_WIDTH);
    const topInterpolate = Animated.interpolate(mainTransition, {
        inputRange: [0, TOP_INT],
        outputRange: [1, 0]
    });
    const backgroundInterpolate = bInterpolateColor(
        mainTransition,
        Colors.green,
        Colors.white
    );
    const textColorInterpolate = bInterpolateColor(
        mainTransition,
        Colors.white,
        Colors.black
    );

    // fetch list
    useEffect(() => {
        setList(Convert(jsonInput));
    }, []);

    function onShowPressed(): void {
        setShowHours(!showHours);
    }

    function onLanguagePressed(): void {
        I18n.locale = LOOP_LANGUAGE[language];
        setLanguage(LOOP_LANGUAGE[language]);
    }

    if (!list.length) {
        return (
            <View testID="ActivityIndicator" style={styles.container}>
                <ActivityIndicator size="large" color={Colors.green} />
            </View>
        );
    }

    return (
        <View testID="card-view" style={styles.container}>
            <StatusBar backgroundColor="transparent" barStyle="dark-content" />
            <Animated.View style={{ top: topInterpolate }}>
                <TouchableHighlight
                    testID="button"
                    style={styles.btnWrapper}
                    onPress={onShowPressed}
                >
                    <Animated.View
                        testID="animated-view"
                        style={[
                            styles.animationContainer,
                            {
                                height: heightContainerInterpolate,
                                width: widthInterpolate,
                                backgroundColor: backgroundInterpolate
                            }
                        ]}
                    >
                        <View style={styles.visibleView}>
                            <AnimatedIcon
                                name="clock"
                                color={textColorInterpolate}
                                size={20}
                            />
                            <Animated.Text
                                style={[
                                    styles.visibleViewText,
                                    {
                                        color: textColorInterpolate
                                    }
                                ]}
                            >
                                {I18n.t('opening_hours')}
                            </Animated.Text>
                            <Chevron transition={mainTransition} />
                        </View>
                        <Animated.View
                            testID="view-item"
                            style={[
                                styles.minimizedView,
                                {
                                    height: heightListInterpolate,
                                    opacity: heightListOpacity
                                }
                            ]}
                        >
                            {list.map((item, key) => (
                                <Item {...{ item, key }} />
                            ))}
                        </Animated.View>
                    </Animated.View>
                </TouchableHighlight>
            </Animated.View>
            <TouchableOpacity
                testID="lang-button"
                onPress={onLanguagePressed}
                style={styles.btnFloating}
            >
                <Text style={styles.textFloating}>
                    {LOOP_LANGUAGE[language]}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default App;
