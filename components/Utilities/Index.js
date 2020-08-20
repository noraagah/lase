import React, { useEffect, useReducer, useContext } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import KeyContext from '../../KeyContext';
import { LightStyles, DarkStyles } from '../../constants/globalStyle';

import GrowthCal from './GrowthCalendar/Index';
import STO from './STOGeneration/STOGenerator';
import WaferLog from './WaferUtils/WaferLog';
import DeleteManager from './DeleteManager';
const Tab = createMaterialTopTabNavigator();

let onWeb = Platform.OS === "web";

export default function Utilities(props) {
    const { dark } = useContext(KeyContext);
    const [styles, updateStyles] = useReducer(() => StyleSheet.create(dark ? DarkStyles : LightStyles), {});
    useEffect(updateStyles, [dark]);

    return (
        <View style={styles.screenContainer}>
            <Tab.Navigator  initialRouteName="Browse"
                            tabBarOptions={{
                                scrollEnabled: !onWeb,
                            }}
                            swipeEnabled={!onWeb}>
                <Tab.Screen name="Growth Calendar" component={GrowthCal}/>
                <Tab.Screen name="STO Generation" component={STO}/>
                <Tab.Screen name="Wafer Log" component={WaferLog}/>
                <Tab.Screen name="Delete" component={DeleteManager}/>
            </Tab.Navigator>
        </View>
    );
}
