/* Налаштування АЦСК за замовчанням*/
const g_CADefaultSettings = {
    "issuerCNs": ["Акредитований центр сертифікації ключів ІДД ДФС",
        "Акредитований центр сертифікації ключів ІДД Міндоходів",
        "Акредитований центр сертифікації ключів ІДД ДПС"],
    "address": "acskidd.gov.ua",
    "ocspAccessPointAddress": "acskidd.gov.ua/services/ocsp/",
    "ocspAccessPointPort": "80",
    "cmpAddress": "acskidd.gov.ua",
    "tspAddress": "acskidd.gov.ua",
    "tspAddressPort": "80",
    "directAccess": true
}

export default class Signer {
    constructor() {
        this._euSign = null;
        this.eu = ''
    }

    get euSign() {
        if (this._euSign == null) {
            this._euSign = window.EUSignCP()
        }
        return this._euSign
    }

    /* Ініціалізація налаштувань криптографічної бібліотеки */
    setSettings(CAs, CASettings) {
        var offline = true;
        var useOCSP = false;
        var useCMP = false;

        offline = ((CASettings == null) ||
            (CASettings.address == "")) ?
            true : false;
        useOCSP = (!offline && (CASettings.ocspAccessPointAddress != ""));
        useCMP = (!offline && (CASettings.cmpAddress != ""));

        this.euSign.SetJavaStringCompliant(true);

        var settings = this.euSign.CreateFileStoreSettings();
        settings.SetPath('');
        settings.SetSaveLoadedCerts(false);
        this.euSign.SetFileStoreSettings(settings);

        settings = this.euSign.CreateModeSettings();
        settings.SetOfflineMode(offline);
        this.euSign.SetModeSettings(settings);

        settings = this.euSign.CreateProxySettings();
        this.euSign.SetProxySettings(settings);

        settings = this.euSign.CreateTSPSettings();
        settings.SetGetStamps(!offline);
        if (!offline) {
            if (CASettings.tspAddress != "") {
                settings.SetAddress(CASettings.tspAddress);
                settings.SetPort(CASettings.tspAddressPort);
            } else if (g_CADefaultSettings) {
                settings.SetAddress(g_CADefaultSettings.tspAddress);
                settings.SetPort(g_CADefaultSettings.tspAddressPort);
            }
        }
        this.euSign.SetTSPSettings(settings);

        settings = this.euSign.CreateOCSPSettings();
        if (useOCSP) {
            settings.SetUseOCSP(true);
            settings.SetBeforeStore(true);
            settings.SetAddress(CASettings.ocspAccessPointAddress);
            settings.SetPort(CASettings.ocspAccessPointPort);
        }
        this.euSign.SetOCSPSettings(settings);

        settings = this.euSign.CreateOCSPAccessInfoModeSettings();
        settings.SetEnabled(true);
        this.euSign.SetOCSPAccessInfoModeSettings(settings);
        settings = this.euSign.CreateOCSPAccessInfoSettings();
        for (var i = 0; i < CAs.length; i++) {
            settings.SetAddress(CAs[i].ocspAccessPointAddress);
            settings.SetPort(CAs[i].ocspAccessPointPort);

            for (var j = 0; j < CAs[i].issuerCNs.length; j++) {
                settings.SetIssuerCN(CAs[i].issuerCNs[j]);
                this.euSign.SetOCSPAccessInfoSettings(settings);
            }
        }

        settings = this.euSign.CreateCMPSettings();
        settings.SetUseCMP(useCMP);
        if (useCMP) {
            settings.SetAddress(CASettings.cmpAddress);
            settings.SetPort("80");
        }
        this.euSign.SetCMPSettings(settings);

        settings = this.euSign.CreateLDAPSettings();
        this.euSign.SetLDAPSettings(settings);
    }

    get doesNeedSetSettings() {
        return this.euSign.DoesNeedSetSettings()
    }

    initSettings(certificatesData, CAs, CACommonName) {
        this.init()
        if (this.euSign.DoesNeedSetSettings()) {
            this.euSign.SetXMLHTTPProxyService('/proxy')
            /* Зчитування файлу з налаштуваннями АЦСК */

            /* Отримання налаштувань АЦСК для ос. ключа */
            let CASettings = null;
            for (var i = 0; i < CAs.length; i++) {
                for (var j = 0; j < CAs[i].issuerCNs.length; j++) {
                    if (CACommonName == CAs[i].issuerCNs[j]) {
                        CASettings = CAs[i];
                        break;
                    }
                }

                if (CASettings)
                    break;
            }

            /* Встановлення параметрів за замовчанням */
            this.setSettings(CAs, CASettings);

            /* Завантаження сертифікатів ЦСК */
            if (certificatesData) {
                this.euSign.SaveCertificates(certificatesData)
            }
        }
    }

    init() {
        if (!this.euSign.IsInitialized()) {
            /* Ініціалізація криптографічної бібліотеки */
            this.euSign.Initialize()
        }
    }

    readPrivateKeyInfo(pKeyData, password) {
        this.init()

        return this.euSign.ReadPrivateKeyBinary(pKeyData, password)
    }

    static isEUSignCPModuleLoaded() {
        return window.isEUSignCPModuleLoaded
    }

    static isEUSignCPModuleInitialized() {
        return window.isEUSignCPModuleInitialized
    }
}
