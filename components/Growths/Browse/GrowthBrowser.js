/*Creates a stack navigator to wrap the filter and browse functionalities of the
growth browser*/
// Imports
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SampleDetails from './SampleDetails.js';
import FilterGrowths from './FilterGrowths.js';
import GrowthDetails from './GrowthDetails.js';
import AddGrowth from './AddGrowth.js';


// Create the stack navigator
const Stack = createStackNavigator();

export default function GrowthBrowser(props) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Filter Growths" component={FilterGrowths} options={{headerShown: false}}/>
            <Stack.Screen name="Sample Details" component={SampleDetails}/>
            <Stack.Screen name="Growth Details" component={GrowthDetails}/>
            <Stack.Screen name="Add Growth" component={AddGrowth}/>
        </Stack.Navigator>
    )
}
