import React, { useState, useEffect, useReducer, useContext } from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { BASE_URL } from '../../../constants/API.js';
const fetch = require('node-fetch');
import { Ionicons } from '@expo/vector-icons';
import SelectSystem from '../../lib/forms/SelectSystem';
import SelectMember from '../../lib/forms/SelectMember';

import UserContext from './UserContext';

//none of the filtering should be in this file, only keep QueryString

const QueryString = filter => `${Object.keys(filter).reduce((acc, cur) => `${acc}&${cur}=${filter[cur]}`, "")}`;

export default function CustomViewer(props) {
    // Gets the name of the machine we're watching through props.route.params.system
    // Current filter state is in props.route.params.filter

    const context = useContext(UserContext);
    const [growths, setGrowths] = useState({loaded: false, contents: []});


    useEffect(() => {
        let load = async () => {
            let response = await fetch(`${BASE_URL}/machine/${context.systems[props.route.params.sysIndex]}/growths?${QueryString(context.filter)}`).then(r => r.json());
            setGrowths({loaded: true, contents: response.results});
        }
        load();
    }, [context.filter]);

    return (
        <View style={styles.container}>
        <View style={{padding:20}}>
            <Text style={{fontSize: 16, fontWeight: '500'}}>Select a growth's ID to view associated items:</Text>
        </View>

        {
            growths.loaded ? (

                <View style={styles.listContainer}>

                    {/*displays a flatlist of all the growths */}
                    <ScrollView>

                        <FlatList
                            style={styles.list}
                            data={growths.contents}
                            keyExtractor={item => item.id.toString()}
                            initialNumToRender={10}
                            renderItem={({item}) => (
                                <View style={styles.growthRow}>
                                    <View style={{width: 30, marginRight:20}}>
                                        <TouchableOpacity   style={styles.openGrowthButton}
                                                        onPress={() => props.navigation.navigate("Sample Details ", {sample: item}, {systems: context.systems})}>
                                            <Text style={{width: 40, fontSize: 16, color: 'blue'}}>{item.id}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style= {{marginLeft: 5, marginRight: -20}}>
                                        <Text style={styles.rowText}>{item.sampleID}</Text>
                                    </View>
                                    <View style= {{margin: -20}}>
                                        <Text style={styles.rowText}>{item.machine}</Text>
                                    </View>
                                    <View style= {{margin: -40}}>
                                        <Text style={styles.rowText}>{item.grower}</Text>
                                    </View>
                                </View>
                            )}/>
                    </ScrollView>
                </View>


            ) : (
                <View style={{marginTop: 50}}>
                    <ActivityIndicator size="large" color="#0000ff"/>
                </View>
            )

        }

        </View>
    )
}


// StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    listContainer: {
        flex: 1,
        paddingLeft: 30,
        marginTop: -20,
    },
    list: {
        margin: 10,
        marginBottom: 30,
    },
    growthRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 9,
        margin: 4,

    },

    openGrowthButton: {
        width: 18,
        margin: 4,
        borderRadius: 5,
        backgroundColor: "white",
    },
    rowText: {
        fontSize: 16,
        color: "black",
        width: 150,

    },
});
