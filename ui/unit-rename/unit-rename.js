/**
 * @file unit-rename.ts
 * @copyright 2025, Firaxis Games
 * @description Panel for renaming units.
 */
import Panel from '/core/ui/panel-support.js';
import { MustGetElement } from '/core/ui/utilities/utilities-dom.js';
import { TextBoxTextChangedEventName, TextBoxTextEditStopEventName } from '/core/ui/components/fxs-textbox.js';
import { InputEngineEventName } from '/core/ui/input/input-support.js';

console.warn("----------------------------------");
console.warn("TCS IMPROVED UNIT RENAMING (TCS-IUR) - LOADED");
console.warn("----------------------------------");
	
export const UnitRenameConfirmEventName = 'unit-rename-confirm';
export class UnitRenameConfirmEvent extends CustomEvent {
    constructor(newName) {
        super(UnitRenameConfirmEventName, { bubbles: false, cancelable: true, detail: { newName } });
    }
}
class UnitRename extends Panel {
    constructor() {
        super(...arguments);
        this.onCommanderNameConfirmedListener = this.onNameConfirmed.bind(this);
		this.onCommanderNameRandomizedListener = this.onNameRandomized.bind(this); //TCS
		this.onCommanderNameRandomizedCitizenListener = this.onNameRandomizedCitizen.bind(this); //TCS
        this.onTextBoxTextChangedListener = this.onTextBoxTextChanged.bind(this);
        this.onTextBoxEditingStoppedListener = this.onTextBoxEditingStopped.bind(this);
        this.onCloseButtonListener = this.onCloseButton.bind(this);
        this.onEngineInputListener = this.onEngineInput.bind(this);
        this.textboxMaxLength = 32;
		this.debugRenamer = true;
    }
    onInitialize() {
        this.Root.classList.add('absolute', 'w-128', 'h-60', 'trigger-nav-help');
        this.nameEditConfirmButton = MustGetElement(".unit-rename__confirm", this.Root);
        this.nameEditTextBox = MustGetElement(".unit-rename__textbox", this.Root);
        this.nameEditCloseButton = MustGetElement("fxs-close-button", this.Root);
		this.nameEditRandomizeButton = MustGetElement(".unit-rename__randomize_unitpool", this.Root); //TCS
		this.nameEditRandomizeCitizenButton = MustGetElement(".unit-rename__randomize_citizenpool", this.Root); //TCS
		this.nameEditRandomizeButton.setAttribute('data-tooltip-content', Locale.compose("LOC_MOD_TCS_UI_RANDOMIZE_BUTTON_DEFAULT_TOOLTIP"));
		this.nameEditRandomizeCitizenButton.setAttribute('data-tooltip-content', Locale.compose("LOC_MOD_TCS_UI_RANDOMIZE_BUTTON_CITIZEN_POOL_TOOLTIP"));
    }
    onAttach() {
        super.onAttach();
        this.nameEditConfirmButton.addEventListener('action-activate', this.onCommanderNameConfirmedListener);
        this.nameEditConfirmButton.setAttribute("action-key", "inline-accept");
		this.nameEditRandomizeButton.addEventListener('action-activate', this.onCommanderNameRandomizedListener); //TCS
		this.nameEditRandomizeCitizenButton.addEventListener('action-activate', this.onCommanderNameRandomizedCitizenListener); //TCS
        this.nameEditTextBox.addEventListener(TextBoxTextChangedEventName, this.onTextBoxTextChangedListener);
        this.nameEditCloseButton.addEventListener('action-activate', this.onCloseButtonListener);
        this.nameEditTextBox.addEventListener(TextBoxTextEditStopEventName, this.onTextBoxEditingStoppedListener);
        this.Root.addEventListener(InputEngineEventName, this.onEngineInputListener);
        this.nameEditTextBox.setAttribute("max-length", this.textboxMaxLength.toString());
    }
    onDetach() {
        this.nameEditConfirmButton.removeEventListener('action-activate', this.onCommanderNameConfirmedListener);
		this.nameEditRandomizeButton.removeEventListener('action-activate', this.onCommanderNameRandomizedListener); //TCS
		this.nameEditRandomizeCitizenButton.removeEventListener('action-activate', this.onCommanderNameRandomizedCitizenListener); //TCS
        this.nameEditTextBox.removeEventListener(TextBoxTextChangedEventName, this.onTextBoxTextChangedListener);
        this.nameEditTextBox.removeEventListener(TextBoxTextEditStopEventName, this.onTextBoxEditingStoppedListener);
        this.nameEditCloseButton.removeEventListener('action-activate', this.onCloseButtonListener);
        this.Root.removeEventListener(InputEngineEventName, this.onEngineInputListener);
        super.onDetach();
    }
    onNameConfirmed() {
        const textBoxValue = this.nameEditTextBox.getAttribute("value");
        if (textBoxValue == null) {
            console.error("unit-rename: onNameConfirmed - confirming null name.");
            return;
        }
        if (textBoxValue.length == 0) {
            console.warn("unit-rename: onNameConfirmed - confirming empty name. This is probably not intentional.");
        }
        this.Root.dispatchEvent(new UnitRenameConfirmEvent(textBoxValue));
    }
    onTextBoxTextChanged(event) {
        const newString = event.detail.newStr;
        const shouldDisabledConfirm = newString.length == 0;
        this.nameEditConfirmButton.setAttribute("disabled", shouldDisabledConfirm.toString());
    }
    onTextBoxEditingStopped(event) {
        if (event.detail.confirmed) {
            this.onNameConfirmed();
        }
        else {
            this.onCloseButton();
        }
    }
    onEngineInput(event) {
        if (event.detail.status != InputActionStatuses.FINISH) {
            return;
        }
        if (event.detail.name == "accept") {
            this.onNameConfirmed();
        }
        else if (event.isCancelInput()) {
            this.onCloseButton();
        }
    }
    onCloseButton() {
        this.Root.setAttribute("hidden", "true");
    }
    onAttributeChanged(name, oldValue, newValue) {
        switch (name) {
            case "hidden":
                const shouldHide = newValue == "true";
                this.Root.classList.toggle("hidden", shouldHide);
                if (shouldHide) {
                    this.nameEditTextBox.setAttribute("value", "");
                    this.nameEditTextBox.setAttribute("enabled", "false");
                }
                else {
                    if (UI.canDisplayKeyboard()) {
                        this.nameEditTextBox.setAttribute("activated", "true");
                    }
                    else {
                        this.nameEditTextBox.setAttribute("enabled", "true");
                    }
                }
                break;
            default:
                super.onAttributeChanged('disabled', oldValue, newValue);
                break;
        }
    }
	// TCS
	findValidTextKey_UnitNames(array) {
		// Takes an array from the UnitNames table and loops (up to a point) to find a valid one if the original is not valid.
		if (array.length > 0) {
			let randomIndex = Math.floor(Math.random() * array.length);
			if (!Locale.keyExists(array[randomIndex].TextKey)) {
				let counter = 0;
				while (counter < 20 && !Locale.keyExists(array[randomIndex].TextKey)) {
					randomIndex = Math.floor(Math.random() * array.length);
					counter = counter + 1;
				}
				if (!Locale.keyExists(array[randomIndex].TextKey)) {
					randomIndex = 0;
				}
			}
			return randomIndex;
		}
		else {
			return 0;
		}
	}
	findValidTextKey_CitizenNames(array) {
		// Takes an array from the CivilizationCitizenNames table and loops (up to a point) to find a valid one if the original is not valid.
		if (array.length > 0) {
			let randomIndex = Math.floor(Math.random() * array.length);
			if (!Locale.keyExists(array[randomIndex].CitizenName)) {
				let counter = 0;
				while (counter < 20 && !Locale.keyExists(array[randomIndex].CitizenName)) {
					randomIndex = Math.floor(Math.random() * array.length);
					counter = counter + 1;
				}
				if (!Locale.keyExists(array[randomIndex].CitizenName)) {
					randomIndex = 0;
				}
			}
			return randomIndex;
		}
		else {
			return 0;
		}
	}
	getUnitName(prefixType, suffixType) {
		// Returns a unit name as prefix + " " + suffix
		// Taken from the CivilizationCitizenNames table, which is populated with person names
		// Example: "Admiral" + " " + "Inez"
		
		console.warn("[TCS-IUR] Prefix Type: '" + prefixType + "' | Suffix Type: '" + suffixType + "'");
		
		
		// Get Age info
		const iCurrentAge = Game.age;
		const iAntiquityAge = Game.getHash("AGE_ANTIQUITY");
		const iExplorationAge = Game.getHash("AGE_EXPLORATION");
		const iModernAge = Game.getHash("AGE_MODERN");
		
		// Get Player info
		const localPlayerID = GameContext.localPlayerID;
		const localPlayer = Players.get(localPlayerID);
		const localCivType = GameInfo.Civilizations.lookup(localPlayer.civilizationType)?.CivilizationType;
		const localCultureType = GameInfo.VisArt_CivilizationUnitCultures.lookup(localCivType)?.UnitCulture;
		
		if (this.debugRenamer == true) {
			console.warn("[TCS-IUR] Unit Civilization: " + localCivType);
			console.warn("[TCS-IUR] Unit Culture: " + localCultureType);
		}
		
		let suffix;
		let gender = 'MALE';
			
		if (suffixType == "CITIZEN_NAME") {	
			let citizenNames;
			// For Modern Age, filter to Modern names
			if (iCurrentAge == iModernAge) {
				citizenNames = GameInfo.CivilizationCitizenNames.filter(item => (item.CivilizationType == localCivType && item.Modern == 1));
				// If no Modern names, get all
				if (!citizenNames || citizenNames.length == 0) {citizenNames = GameInfo.CivilizationCitizenNames.filter(item => (item.CivilizationType == localCivType));}
			}
			else {citizenNames = GameInfo.CivilizationCitizenNames.filter(item => (item.CivilizationType == localCivType));}
			
			let randomSuffix;
			if (!citizenNames || citizenNames.length == 0) {
				const armySuffixes = GameInfo.UnitNames.filter(item => (item.NameType == suffixType));
				const randomSuffix = this.findValidTextKey_UnitNames(armySuffixes);
				suffix = Locale.compose(armySuffixes[randomSuffix].TextKey);
				prefixType = "PREFIX_UNITS_ALL"; //prefixType needs to be Creative now
				console.warn("[TCS-IUR] FALLBACK! Generated Creative suffix: '" + suffix + "'");
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
			else {
				const randomSuffix = this.findValidTextKey_CitizenNames(citizenNames);
				suffix = Locale.compose(citizenNames[randomSuffix].CitizenName);
				if (citizenNames[randomSuffix].Female == 1) {
					gender = 'FEMALE';
				}
				console.warn("[TCS-IUR] Generated Citizen suffix: '" + suffix + "'");
			}
		}
		else {
			const armySuffixes = GameInfo.UnitNames.filter(item => (item.NameType == suffixType));
			const randomSuffix = this.findValidTextKey_UnitNames(armySuffixes);
			suffix = Locale.compose(armySuffixes[randomSuffix].TextKey);
			console.warn("[TCS-IUR] Generated Creative suffix: '" + suffix + "'");
		}
		
		// Update prefixType for certain civilizations/regions
		if (localCivType == "CIVILIZATION_ROME") {
			if (prefixType == 'PREFIX_RANK_LAND') {
				prefixType = 'PREFIX_RANK_LAND_ROME';
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
		}
		else if (localCivType == "CIVILIZATION_GREECE") {
			if (prefixType == 'PREFIX_RANK_LAND') {
				prefixType = 'PREFIX_RANK_LAND_GREECE';
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
		}
		else if (localCivType == "CIVILIZATION_HAN") {
			if (prefixType == 'PREFIX_RANK_LAND') {
				prefixType = 'PREFIX_RANK_LAND_HAN';
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
		}
		else if (localCivType == "CIVILIZATION_PERSIA") {
			if (prefixType == 'PREFIX_RANK_LAND') {
				prefixType = 'PREFIX_RANK_LAND_PERSIA';
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
		}
		
		// Update prefixType if gender is not male, but only for Exploration Age (for now)
		if (gender == 'FEMALE' && iCurrentAge == iExplorationAge) {
			if (prefixType == 'PREFIX_RANK_LAND') {
				prefixType = 'PREFIX_RANK_LAND_FEMALE';
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
			else if (prefixType == 'PREFIX_RANK_SEA') {
				prefixType = 'PREFIX_RANK_SEA_FEMALE';
				console.warn("[TCS-IUR] Prefix Type Changed: '" + prefixType + "'" );
			}
		}
		
		// Get prefix
		const armyPrefixes = GameInfo.UnitNames.filter(item => (item.NameType == prefixType));
		const randomPrefix = this.findValidTextKey_UnitNames(armyPrefixes);
		const prefix = Locale.compose(armyPrefixes[randomPrefix].TextKey);
		console.warn("[TCS-IUR] Generated prefix: '" + prefix + "'");
		
		const nameTemplate = "LOC_UNITNAME_BASE_TEMPLATE";
		const unitName = Locale.compose(nameTemplate, prefix, suffix);
		console.warn("[TCS-IUR] Generated name: '" + unitName + "'");
		return unitName;
	}
	onNameRandomized() {
		
		// Get Commander domain
		const unitComponentID = UI.Player.getHeadSelectedUnit();
		let unitDomain = undefined;
		let unitRank = undefined;
		let prefixType = undefined;
		let suffixType = undefined;
		if (ComponentID.isValid(unitComponentID)) {
            const unit = Units.get(unitComponentID);
            if (unit) {
                const unitInfo = GameInfo.Units.lookup(unit.type);
				if (this.debugRenamer == true) {
					console.warn("[TCS-IUR] Unit Type: " + unitInfo.UnitType);
					console.warn("[TCS-IUR] Unit Formation: " + unitInfo.FormationClass);
				}
				if (unitInfo.FormationClass == "FORMATION_CLASS_COMMAND") {
					unitDomain = unitInfo.Domain;
					unitRank = unit.Experience?.getLevel;
					if (unitInfo.Domain == "DOMAIN_AIR") {
						prefixType = "PREFIX_UNITS_ALL";
						suffixType = "SUFFIX_SQUADRON_ALL";
					}
					else if (unitInfo.Domain == "DOMAIN_LAND") {
						prefixType = "PREFIX_UNITS_ALL";
						suffixType = "SUFFIX_ARMY_ALL";
					}
					else if (unitInfo.Domain == "DOMAIN_SEA") {
						prefixType = "PREFIX_UNITS_ALL";
						suffixType = "SUFFIX_FLEET_ALL";
					}
					else {console.warn("[TCS-IUR] WARNING! Invalid unit domain type: " + unitInfo.Domain);}
				}
            }
        }
		
		if (this.debugRenamer == true) {
			console.warn("[TCS-IUR] Unit Domain: " + unitDomain);
			console.warn("[TCS-IUR] Unit Rank: " + unitRank);
			console.warn("[TCS-IUR] Prefix Type: " + prefixType);
			console.warn("[TCS-IUR] Suffix Type: " + suffixType);
		}
		
		// Disable randomize button if selected unit is not a valid commander
		if (!prefixType || !suffixType) {
			this.nameEditRandomizeButton.setAttribute("disabled", true.toString());
			return;
		}
		else {
			this.nameEditRandomizeButton.setAttribute("disabled", false.toString());
		}
		
		// Initialize randomized unit name
		let unitName = "";
		
		// Randomize Option: Use UnitNames table.
		unitName = this.getUnitName(prefixType, suffixType);
		
		// Add randomized name to input box
		if (unitName.length > 0) {this.nameEditTextBox.setAttribute("value", unitName);}
		
		// Enable "Confirm" button
		const shouldDisabledConfirm = unitName.length == 0;
        this.nameEditConfirmButton.setAttribute("disabled", shouldDisabledConfirm.toString());
	}
	onNameRandomizedCitizen() {
		
		// Get Commander domain
		const unitComponentID = UI.Player.getHeadSelectedUnit();
		let unitDomain = undefined;
		let unitRank = undefined;
		let prefixType = undefined;
		let suffixType = undefined;
		if (ComponentID.isValid(unitComponentID)) {
            const unit = Units.get(unitComponentID);
            if (unit) {
                const unitInfo = GameInfo.Units.lookup(unit.type);
				if (this.debugRenamer == true) {
					console.warn("[TCS-IUR] Unit Type: " + unitInfo.UnitType);
					console.warn("[TCS-IUR] Unit Formation: " + unitInfo.FormationClass);
				}
				if (unitInfo.FormationClass == "FORMATION_CLASS_COMMAND") {
					unitDomain = unitInfo.Domain;
					unitRank = unit.Experience?.getLevel;
					suffixType = "CITIZEN_NAME";
					if (unitInfo.Domain == "DOMAIN_AIR") {
						prefixType = "PREFIX_RANK_AIR";
					}
					else if (unitInfo.Domain == "DOMAIN_LAND") {
						prefixType = "PREFIX_RANK_LAND";
					}
					else if (unitInfo.Domain == "DOMAIN_SEA") {
						prefixType = "PREFIX_RANK_SEA";
					}
					else {console.warn("[TCS-IUR] WARNING! Invalid unit domain type: " + unitInfo.Domain);}
				}
            }
        }
		
		if (this.debugRenamer == true) {
			console.warn("[TCS-IUR] Unit Domain: " + unitDomain);
			console.warn("[TCS-IUR] Unit Rank: " + unitRank);
			console.warn("[TCS-IUR] Prefix Type: " + prefixType);
			console.warn("[TCS-IUR] Suffix Type: " + suffixType);
		}
		
		// Disable randomize button if selected unit is not a valid commander
		if (!prefixType || !suffixType) {
			this.nameEditRandomizeButton.setAttribute("disabled", true.toString());
			return;
		}
		else {
			this.nameEditRandomizeButton.setAttribute("disabled", false.toString());
		}
		
		// Initialize randomized unit name
		let unitName = "";
		
		// Randomize Option: Use CivilizationCitizenNames table
		unitName = this.getUnitName(prefixType, suffixType);
				
		// Add randomized name to input box
		if (unitName.length > 0) {this.nameEditTextBox.setAttribute("value", unitName);}
		
		// Enable "Confirm" button
		const shouldDisabledConfirm = unitName.length == 0;
        this.nameEditConfirmButton.setAttribute("disabled", shouldDisabledConfirm.toString());
	}
}
Controls.define("unit-rename", {
    createInstance: UnitRename,
    description: 'Unit Renaming Panel',
    content: ['fs://game/base-standard/ui/unit-rename/unit-rename.html'],
    styles: ['fs://game/base-standard/ui/unit-rename/unit-rename.css'],
    attributes: [
        {
            name: "hidden",
            description: "If the rename panel is showing or not"
        }
    ]
});

//# sourceMappingURL=file:///base-standard/ui/unit-rename/unit-rename.js.map
