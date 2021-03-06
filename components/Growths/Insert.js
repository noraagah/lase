import React, { useContext, useEffect, useReducer, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Button, TextInput } from 'react-native';
import { BASE_URL } from '../../constants/API.js';
import SelectSystem from '../lib/forms/SelectSystem';
import SelectMember from '../lib/forms/SelectMember';
import SelectSubstrate from '../lib/forms/SelectSubstrate';
import SelectSubstrateSize from '../lib/forms/SelectSubstrateSize';
import Checkbox from '../lib/forms/Checkbox';
const fetch = require("node-fetch");
const moment = require("moment");
import { AntDesign, EvilIcons } from '@expo/vector-icons';

import { LightStyles, DarkStyles, Colors } from '../../constants/globalStyle';
import KeyContext from '../../KeyContext';


const Default = {
    date: "",               // Reserved

    growthNum: "",          // Sample Description
    substrate: "",          // Sample Description
    substrateSize: "",      // Sample Description
    machine: "",            // Sample Description
    grower: "",             // Sample Description


    PyroDeox: "",           // Deox
    TCDeox: "",             // Deox
    PyroGrowth: "",         // Deox
    TCGrowth: "",           // Deox


    HVP: "",                // Deox
    PyroOffset: "",         // Deox

    Description: "",        // Sample Description

    GCPressure: "",         // STO Temp
    BFBackground: "",       // STO Temp
    Ga_Tip: "",             // STO Temp
    Ga_Base: "",
    Ga_Flux: "",
    In_Tip: "",
    In_Base: "",
    In_Flux: "",
    Al_Base: "",
    Al_Flux: "",
    La_Temp: "",
    La_Flux: "",
    Lu_Temp: "",
    Lu_Flux: "",
    As_Sub: "",
    As_Crk: "",
    Chamber_Background: "",
    BF_Background: "",
    Bi_Temp: "",
    Bi_Flux: "",
    Bi_Tip: "",
    Bi_Base: "",
    Gd_Temp: "",
    Gd_Flux: "",
    GaP_Temp: "",
    GaP_Flux: "",
    B_Temp: "",
    B_Flux: "",             // STO Temp

    waferTracked: "",       // Sample Description
}
const MATERIAL_DEFAULTS = {
    Echo: {
        mat_name: "",
        mat_description: "",
        Si_temp: 350,
        Be_temp: 350,
        GaTe_temp: 100,
        As_valve: 0,
        As_flux: 0,
        mat_Pyro: 0,
        mat_TC: 0,
        mat_Rot: "5 rpm",
    },
    Bravo: {
        mat_name: "",
        mat_description: "",
        Si_temp: 350,
        Be_temp: 350,
        GaTe_temp: 100,
        N_RF_power: 0,
        N_RF_reflected: 0,
        N_flow: 0,
        N_foreline_pressure: 0,
        N_optical: 0,
        As_valve: 0,
        As_flux: 0,
        Sb_valve: 0,
        Sb_flux: 0,
        mat_Pyro: 0,
        mat_TC: 0,
        mat_Rot: "5 rpm",
    }
}
const STO_DEFAULTS = {
    Echo: {
        Chamber_Background: "",
        BF_Background: "",
        Ga_Tip: 350,
        Ga_Base: "IDLE",
        Ga_Flux: 0,
        In_Tip: 350,
        In_Base: "IDLE",
        In_Flux: 0,
        Bi_Tip: "IDLE",
        Bi_Base: "IDLE",
        Bi_Flux: 0,
        B_Temp: "",
        B_Flux: 0,
        GaP_Temp: "",
        GaP_Flux: 0,
        As_Sub: 28.5,
        As_Crk: 850,
    },
    Bravo: {
        Chamber_Background: "",
        BF_Background: "",
        Ga_Tip: 350,
        Ga_Base: "IDLE",
        Ga_Flux: 0,
        In_Tip: 350,
        In_Base: "IDLE",
        In_Flux: 0,
        Al_Base: 800,
        Al_Flux: 0,
        Er_Base: 400,
        Er_Flux: 0,
        Bi_Tip: 350,
        Bi_Base: "IDLE",
        Bi_Flux: 0,
        As_Sub: 400,
        As_Crk: 850,
        Sb_Sub: 72,
        Sb_Crk: 900,
    }
}
const TRACK_BY_DEFAULT = true;

export default function AddGrowth(props) {
    const { dark } = useContext(KeyContext);
    const [styles, updateStyles] = useReducer(() => StyleSheet.create({...(dark ? DarkStyles : LightStyles), ...LocalStyles}), {});
    useEffect(updateStyles, [dark]);

    const key = null;

    const [form, updateForm] = useReducer(
        (state, {key, value}) => {
            if(key === "machine_reset") return {
                SampleID: state.SampleID,
                GrowthNum: state.GrowthNum,
                Date: state.Date,
                Machine: state.Machine,
                Grower: state.Grower,
                Substrate: state.Substrate,
                SubstrateSize: state.substrateSize,
                Description: state.Description,
            }
            return {...state, [key]: value}
        }, {
        SampleID: props.route.params.sampleID,
        Date: moment().format("YYYY-MM-DD"),
        Machine: "",
        SubstrateSize: "",
        Description: "",
    });
    const [substrates, setSubstrates] = useState([]);
    useEffect(() => {
        async function load() {
            let { substrates } = await fetch(`${BASE_URL}/settings/substrates`,
                { headers: { "x-api-key": "###TODO###" } }).then(r => r.json());
            setSubstrates(substrates);
        }
        load();
    }, []);
    const [machineSources, setMSS] = useState([]);
    useEffect(() => {
        // Set screen title
        props.navigation.setOptions({
            title: `Add Growth to ${props.route.params.sampleID}`,
        });

        async function load_sources() {
            let machines = await fetch(`${BASE_URL}/settings/machines`).then(async r => (await r.json()).machines);
            let sources = await Promise.all(machines.map(async m => ({
                machine: m,
                sources: await fetch(`${BASE_URL}/machine/${m}/sources`).then(async r => (await r.json()).sources),
            })));
            setMSS(sources.concat([{
                machine: "",
                sources: [],
            }]));
        }

        async function get_growth_num() {
            const resp = await fetch(`${BASE_URL}/machine/${props.route.params.machine}/growths?SampleID=${props.route.params.sampleID}`).then(r => r.json());
            if(resp.statusCode !== 200) window.alert("Growth number could not be retrieved");

            let num = parseInt(resp.results.reduce((acc, { growthNum }) => growthNum > acc ? growthNum : acc, Number.NEGATIVE_INFINITY)) + 1;
            updateForm({key: "GrowthNum", value: num ? num : 1});
        }

        load_sources();
        get_growth_num();
    }, []);

    // The value determines which entry area / material is currently shone
    const [view, updateView] = useReducer(
        (state, {section, value}) => ({...state, [section]: value}), {
        top: 0,
        bottom: -1,
    });

    const [materials, dispatchMaterials] = useReducer((state, action) => {
        // Deep copy the current state
        let nextState = state.concat([]);
        switch(action.type) {
            // Update some aspect of a particular material
            case "update":
                nextState[action.src][action.key] = action.value;
                break;

            // Switch the location of a pair of materials
            case "reorder":
                let dst = nextState[action.dst];
                nextState[action.dst] = nextState[action.src];
                nextState[action.src] = dst;
                if(action.src === view.bottom) updateView({section: "bottom", value: action.dst});
                else if(action.dst === view.bottom) updateView({section: "bottom", value: action.src});
                break;

            // Add a new material by inserting the default for the current machine
            // Unique key is generated from the current time
            case "insert":
                if(!action.machine) return nextState;
                nextState.push(Object.assign({}, MATERIAL_DEFAULTS[action.machine], {
                    key: moment().valueOf(),
                }));
                break;

            case "remove":
                if(view.bottom >= action.index && !(state.length > 1 && view.bottom === 0 && action.index === 0)) updateView({section: "bottom", value: view.bottom - 1});
                nextState.splice(action.index, 1);
                break;

            case "reset":
                return [];
        }
        return nextState;
    }, []);
    useEffect(() => {
        dispatchMaterials({type: "reset"});
        updateForm({key: "machine_reset"});
    }, [form.Machine]);
    const [doTracking, toggleTracking] = useReducer(doTracking => doTracking, TRACK_BY_DEFAULT);
    async function TrackWafer() {
        if(!doTracking) return;

        // Check wafer validity
        console.log((substrates.find(({substrate}) => substrate === form.Substrate) || {size: ""}).size);
        if((substrates.find(({substrate}) => substrate === form.Substrate) || {size: ""}).size === (form.SubstrateSize.indexOf("2 inch") > -1 ? 2 : 3)) {
            // Add wafer log entry
            // let resp = await fetch(`${BASE_URL}/wafers/${form.Substrate}`, {
            //     headers: { "x-api-key": "###TODO###" }
            // }).then(r => r.json());
            // console.log(resp);
        } else {
            // Invalid
            window.alert("The size and type you selected are incompatible; the wafer log was not updated.");
        }
    }
    async function SubmitForm() {
        const resp = await fetch(`${BASE_URL}/machine/${form.Machine}/growths`, {
            method: "PUT",
            headers: {
                "x-api-key": key,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                form,
            })
        }).then(r => r.json());
        if(resp.statusCode !== 200) window.alert("");
        else {
            let { growth } = await fetch(`${BASE_URL}/machine/${form.Machine}/growths`,
                { headers: { "x-api-key": key } })
                .then(r => r.json());

            // open the newly created growth record
            if(growth) props.navigation.navigate("Growth Details", { growth });
            else window.alert("Growth was inserted, but couldn't be navigated to.");
        }
    }
    function handleSubmit() {
        // SubmitForm(props.navigation, form);
        TrackWafer();
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Main data entry */}
                <View style={styles.mainDataEntry}>
                    <View style={{flexDirection: "row"}}>
                        <TouchableOpacity style={[styles.tabButton, view.top === 0 ? {backgroundColor: "#ADD"} : {}]}
                            onPress={() => updateView({section: "top", value: 0})}>
                            <Text>Sample Description</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabButton, view.top === 1 ? {backgroundColor: "#ADD"} : {}]}
                            onPress={() => updateView({section: "top", value: 1})}>
                            <Text>STO Temps</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabButton, view.top === 2 ? {backgroundColor: "#ADD"} : {}]}
                            onPress={() => updateView({section: "top", value: 2})}>
                            <Text>Deox</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{display: view.top === 0 ? "" : "none"}}>
                        <Text style={styles.subtitle}>Pre-filled data</Text>
                        <Text>Sample ID: {props.route.params.sampleID}</Text>
                        <Text>Growth number: {form.GrowthNum || ""}</Text>
                        <Text>Date: {form.Date}</Text>
                        <Text style={styles.subtitle}>Manual entry data</Text>
                        <Text style={{fontSize: 10, fontWeight: "bold"}}>
                            <Text style={{color: "orange"}}>Caution:</Text>
                            <Text> Changing the selected system will erase data in the </Text>
                            <Text style={{color: "red"}}>STO Temps</Text>
                            <Text> and </Text>
                            <Text style={{color: "red"}}>Deox</Text>
                            <Text> areas.</Text>
                        </Text>
                        <SelectSystem
                            style={{margin: 5}}
                            update={value => updateForm({key: "Machine", value})}
                            placeholder={{label: "Select system..." , value:  ""}}/>
                        <SelectMember
                            style={{margin: 5}}
                            update={value => updateForm({key: "Grower", value})}
                            placeholder={{label: "Select grower...", value: ""}}/>
                        <SelectSubstrate
                            style={{margin: 5}}
                            update={value => updateForm({key: "Substrate", value})}
                            placeholder={{label: "Select substrate...", value: ""}}/>
                        <SelectSubstrateSize
                            style={{margin: 5}}
                            update={value => updateForm({key: "SubstrateSize", value})}
                            placeholder={{label: "Select size...", value: ""}}/>
                        <View
                            style={{flexDirection: "row", alignItems: "center"}}>
                            <Text style={{marginRight: 10}}>Wafer Tracking</Text>
                            <Checkbox
                                startChecked={TRACK_BY_DEFAULT}
                                onChange={toggleTracking}/>
                        </View>
                        <TextInput
                            placeholder="Growth description"
                            multiline={true}
                            numberOfLines={3}
                            onChangeText={desc => updateForm({key: "Description", value: desc})}
                            value={form.Description || ""}/>
                    </View>

                    <View style={{display: view.top === 1 ? "" : "none"}}>
                        <Text>STO Temperatures and Fluxes</Text>
                        {machineSources.length > 0 ? machineSources.find(({machine}) => machine === form.Machine).sources.filter(({sto, active}) => sto && active).map(src => (
                            <View key={src.id}>
                                <Text>{src.source}</Text>
                                {src.tip ? (<Text>### Tip: {src.tip_idle || 0}</Text>): (<View/>)}
                                {src.base ? (<Text>### Base: {src.base_idle || 0}</Text>): (<View/>)}
                                {src.flux ? (<Text>### BEP: {src.flux_idle || 0}</Text>): (<View/>)}
                            </View>
                        )) : (<View/>)}
                        <Text>Group Vs</Text>
                        {machineSources.length > 0 ? machineSources.find(({machine}) => machine === form.Machine).sources.filter(({crk, valve}) => crk && valve).map(src => (
                            <View key={src.id}>
                                <Text>{src.source}</Text>
                                <Text>### Sublimator Temp: {src.sub_idle || 0}</Text>
                                <Text>### Cracker Temp: {src.crk_idle || 0}</Text>
                            </View>
                        )) : (<View/>)}
                    </View>

                    <View style={{display: view.top === 2 ? "" : "none"}}>
                        <TextInput
                            placeholder="HVP Power - HVP"
                            keyboardType="numeric"
                            onChangeText={val => null}
                            />
                        <TextInput
                            placeholder="Pyro Current Offset - PyroOffset"
                            keyboardType="numeric"
                            onChangeText={val => null}
                            />
                        <TextInput
                            placeholder="Pyro Deox - PyroDeox"
                            keyboardType="numeric"
                            onChangeText={val => null}
                            />
                        <TextInput
                            placeholder="Thermocouple Deox - TCDeox"
                            keyboardType="numeric"
                            onChangeText={val => null}
                            />
                    </View>
                </View>

                {/* Layer entry area */}
                {form.machine !== "" ? (
                <View style={[styles.mainDataEntry, {borderBottomWidth: 0}]}>
                    <TouchableOpacity
                        style={{flexDirection: "row", alignItems: "center"}}
                        onPress={() => dispatchMaterials({type: "insert", machine: form.Machine})}>
                        <AntDesign name="pluscircleo" size={24} color="black" />
                        <Text style={styles.subtitle}>Add new layer material</Text>
                    </TouchableOpacity>
                    {materials.map((mat, i) => (
                        <View key={mat.key} style={{flexDirection: "row", marginVertical: 2}}>
                            <TouchableOpacity
                                style={{borderColor: "#000", borderWidth: 2, borderRadius: 4}}
                                onPress={() => dispatchMaterials({type: "remove", index: i})}>
                                <EvilIcons name="trash" size={24} color="red" />
                            </TouchableOpacity>
                            <View
                                style={{flexDirection: "row", width: 48, margin: 3}}>
                                {i > 0 ? (<TouchableOpacity
                                    onPress={() => dispatchMaterials({type: "reorder", src: i, dst: i - 1})}>
                                    <AntDesign name="up" size={24} color="black" />
                                </TouchableOpacity>): (<View style={{width: 24}}/>)}
                                {i < materials.length - 1 ? (<TouchableOpacity
                                    onPress={() => dispatchMaterials({type: "reorder", src: i, dst: i + 1})}>
                                    <AntDesign name="down" size={24} color="black" />
                                </TouchableOpacity>): (<View/>)}
                            </View>
                            <TouchableOpacity
                                onPress={() => updateView({section: "bottom", value: i})}>
                                <TextInput
                                    style={{height: "100%", marginLeft: 5}}
                                    placeholder="Layer name"
                                    onChangeText={name => dispatchMaterials({
                                        type: "update", key: "mat_name", value: name, src: i})}
                                    value={mat.Name}/>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {view.bottom > -1 && materials[view.bottom] ? (
                        <View>
                            <Text style={styles.subtitle}>Edit layer details</Text>
                            {Object.keys(materials[view.bottom]).map(key => key === "key" ? (<View key="key"/>) : (
                                <View key={key}
                                    style={{flexDirection: "row", alignItems: "center", marginVertical: 2}}>
                                    <Text style={{width: 100, marginRight: 10}}>{key}</Text>
                                    <TextInput
                                        placeholder={key}
                                        onChangeText={val => dispatchMaterials({
                                            type: "update", key, value: val, src: view.bottom
                                        })}
                                        value={materials[view.bottom][key].toString()}
                                        />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.subtitle}>Add a layer and click on its textbox to edit layer details</Text>
                        </View>
                    )}
                </View>
                ): (
                <View>
                    <Text>You must select a system in order to add new layers, since layers are system-dependent.</Text>
                </View>
                )}
            </ScrollView>

            <View style={{alignItems: 'center', paddingBottom: 50}}>
                <Text style={{color: 'red', textAlign: "left", padding: 20}}>Once submitted, a growth cannot be edited.</Text>
                <Button style={{flexDirection: 'row', marginTop: -15, width: 500}}
                    title="SUBMIT GROWTH"
                    onPress={handleSubmit}/>
            </View>
        </View>
    )
}

const LocalStyles = {
    mainDataEntry: {
        marginHorizontal: 10,
        marginBottom: 30,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: "#CCC",
    },
    tabButton: {
        flex: 1,
        backgroundColor: "#44F",
        padding: 5,
        margin: 5,
        borderRadius: 5,
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    title: {
        margin: 20,
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
    subtitle: {
        margin: 10,
        fontWeight: "bold",
        fontSize: 14,
        textAlign: "left",
    },
    growthRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 9,
        marginBottom: 2,
    },
    rowText: {
        marginRight: 20,
    },
    inputBorder: {
        width: 500,
        borderColor: 'black',
        borderWidth: .03
    },

}
