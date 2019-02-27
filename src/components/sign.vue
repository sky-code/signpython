<template>
    <div>
        <h2>sign</h2>
        <div>
            <dt>isEUSignCPModuleLoaded</dt>
            <dd>{{isEUSignCPModuleLoaded}}</dd>
        </div>
        <div>
            <dt>isEUSignCPModuleInitialized</dt>
            <dd>{{isEUSignCPModuleInitialized}}</dd>
        </div>
        <div>
            <label>
                CA certificates file url <input type="text" v-model="certificatesFileUrl">
            </label>
            <label>
                CAs file url <input type="text" v-model="casFileUrl">
            </label>
            <label>
                CA Common Name <input type="text" v-model="caCommonName">
            </label>
        </div>
        <hr/>
        <button type="button" @click="addKeyFile">Add key</button>
        <div>
            <div v-for="(item, index) in keyFiles" :key="index">
                <button type="button" @click="setSettings(item)">Set settings</button>

                <label>
                    Select key file <input type="file" @change="updateKeyFile(item, $event)">
                </label>
                <div v-if="item.file">
                    <label>
                        Password <input type="password" v-model="item.password">
                    </label>
                    <button type="button" @click="readInfo(item)">read info</button>
                    <div v-if="item.info">
                        <div v-if="item.info.errorMessage">
                            {{item.info.errorMessage}}
                        </div>
                        <div v-else>
                            <pre>
                                {{JSON.stringify(item.info, null, '  ')}}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Signer from '../signer'
    import axios from 'axios'

    export default {
        name: 'sign',
        data() {
            return {
                isEUSignCPModuleLoaded: false,
                isEUSignCPModuleInitialized: false,
                keyFiles: [],
                certificatesFileUrl: '/data/CACertificates.p7b',
                casFileUrl: '/data/CAs.json',
                caCommonName: 'АЦСК АТ КБ «ПРИВАТБАНК»',
            }
        },
        methods: {
            EUSignCPModuleLoadedHandler() {
                this.isEUSignCPModuleLoaded = true
            },
            EUSignCPModuleInitializedHandler() {
                this.isEUSignCPModuleInitialized = true
            },
            addKeyFile() {
                this.keyFiles.push({
                    file: null,
                    password: null,
                    info: null,
                    signer: new Signer()
                })
            },
            updateKeyFile(keyFile, event) {
                keyFile.file = event.target.files[0]
            },
            readInfo(keyFile) {
                const fileReader = new FileReader()
                fileReader.onload = function (event) {
                    const arrayBuffer = event.target.result
                    const pKeyData = new Uint8Array(arrayBuffer)
                    try {
                        keyFile.info = keyFile.signer.readPrivateKeyInfo(pKeyData, keyFile.password)
                    } catch (e) {
                        keyFile.info = {
                            errorMessage: e.message
                        }
                    }
                    try {
                        var data = new Uint8Array(10);
                        var signature = keyFile.signer.euSign.SignData(data, true);

                        console.log("Signature: " + signature);
                    } catch (e) {
                        console.log("Error: " + e);
                    }
                }
                fileReader.readAsArrayBuffer(keyFile.file)
            },
            async setSettings(keyFile) {
                const certificatesFileResponse = await axios.get(this.certificatesFileUrl, {
                    responseType: 'arraybuffer'
                })
                const certificatesData = new Uint8Array(certificatesFileResponse.data)

                const casFileUrlResponse = await axios.get(this.casFileUrl)
                keyFile.signer.initSettings(certificatesData, casFileUrlResponse.data, this.caCommonName)
                alert('ok')
            }
        },
        created() {
            this.isEUSignCPModuleLoaded = Signer.isEUSignCPModuleLoaded()
            if (!this.isEUSignCPModuleLoaded) {
                document.addEventListener('EUSignCPModuleLoaded', this.EUSignCPModuleLoadedHandler, false)
            }

            this.isEUSignCPModuleInitialized = Signer.isEUSignCPModuleInitialized()
            if (!this.isEUSignCPModuleInitialized) {
                document.addEventListener('EUSignCPModuleInitialized', this.EUSignCPModuleInitializedHandler, false)
            }
        },
        beforeDestroy() {
            document.removeEventListener('EUSignCPModuleLoaded', this.EUSignCPModuleLoadedHandler, false)
            document.removeEventListener('EUSignCPModuleInitialized', this.EUSignCPModuleInitializedHandler, false)
        }
    }
</script>
