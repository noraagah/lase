// Landing is the main component which appears under the "Home" tab. It's intended
//  to bear a ressemblance to this page: https://lase.mer.utexas.edu/

// Imports
import React, { useContext, useReducer, useEffect } from 'react';
import Constants from 'expo-constants';
import { View, StyleSheet, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LightStyles, DarkStyles, Colors } from '../../constants/globalStyle';
import KeyContext from '../../KeyContext';

import Overview from './subpages/Overview.js';
import Research from './subpages/Research.js';
import WhatIsMBE from './subpages/WhatIsMBE.js';
import Members from './subpages/Members.js';
import Classes from './subpages/Classes.js';
import Sponsors from './subpages/Sponsors.js';
import Facilities from './subpages/Facilities.js';
import Publications from './subpages/Publications.js';
import News from './subpages/News.js';

// Create a tab navigator. On the home page, this is the component which allows
//  for selecting between the different sub pages.
const Tab = createMaterialTopTabNavigator();

const onWeb = Platform.OS === "web";

export default function Landing(props) {
    const { dark } = useContext(KeyContext);
    const [styles, updateStyles] = useReducer(() => StyleSheet.create({...(dark ? DarkStyles : LightStyles), ...LocalStyles}), {});
    useEffect(updateStyles, [dark]);

    return (
        <View style={styles.screenContainer}>
            <View style={styles.localContainer}>
                {
                    // If we're on web, then we have to show a background image since
                    //  the homepage doesn't consume the full screen. On native, though,
                    //  the content fills the whole screeen so we include no image. Instead,
                    //  we include a status bar banner which pushes content down so it
                    //  doesn't interfere with things like the time, cell reception, etc.
                    Platform.OS === "web" ? (
                        <Image  style={styles.backgroundImage}
                                    resizeMode="stretch"
                                    source={require('../../assets/background.gif')}/>
                    ) : (<View style={styles.statusBarBanner}/>)
                }
                <View style={[styles.document, {backgroundColor: dark ? Colors.baseDark : Colors.base}]}>
                    <Image  style={styles.headerImage}
                            source={require('../../assets/UT_banner.png')}/>
                    <Tab.Navigator  tabBarOptions={{
                                        activeTintColor: dark ? Colors.highlight : Colors.highlightDark,
                                        inactiveTintColor: '#fff',
                                        style: {
                                            backgroundColor: "#000",
                                        },
                                        scrollEnabled: !onWeb,
                                    }}
                                    lazy={true}
                                    swipeEnabled={Platform.OS !== "web"}>
                        <Tab.Screen name="Overview" component={Overview}/>
                        <Tab.Screen name="Research" component={Research}/>
                        <Tab.Screen name="What is MBE?" component={WhatIsMBE}/>
                        <Tab.Screen name="Members" component={Members}/>
                        <Tab.Screen name="Classes" component={Classes}/>
                        <Tab.Screen name="Sponsors" component={Sponsors}/>
                        <Tab.Screen name="Facilities" component={Facilities}/>
                        <Tab.Screen name="Publications" component={Publications}/>
                        <Tab.Screen name="News" component={News}/>
                    </Tab.Navigator>
                </View>
            </View>
        </View>
    )
}

// Helper method which scales images based on the screen's width.
const GetDimension = (width, height, getWidth) => {
    let w = Dimensions.get('window').width;
    if(getWidth) {
        return width > w ? w : width;
    } else {
        return width > w ? (w / width) * height : height;
    }
}

const LocalStyles = {
    localContainer: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "row",
    },
    document: {
        marginTop: onWeb ? 10 : 0,
        flexDirection: "column",
        height: Platform.OS === "web" ? "calc(100% - 20px)" : "100%",
        width: GetDimension(754, 0, true),
    },
    headerImage: {
        width: GetDimension(754, 90, true),
        height: GetDimension(754, 90, false),
        paddingBottom: 20,
        borderColor: "#000",
        borderBottomWidth: 1,
    },
    backgroundImage: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
    },
    statusBarBanner: {
        position: "absolute",
        top: 0,
        left: 0,
        width: Dimensions.get('window').width,
        height: Constants.statusBarHeight,
        backgroundColor: Platform.OS === "android" ? StatusBar.backgroundColor : "#000",
    },
};
