# TCS-Improved-Unit-Renaming
Official releases hosted on [Civfanatics](https://forums.civfanatics.com/resources/tcs-improved-unit-renaming.32129/).

## Description
Adds randomization options when renaming units.

Two buttons are added:
- Citizen
- Creative

![image](https://github.com/user-attachments/assets/a2a44f21-1f91-43a4-9c14-1d4e55ce9728)

Clicking the **Citizen** button will generate a name using a combination of a **rank** (available ranks are based on Age) and a **citizen name** (taken from your Civilization's pool).
Examples:
- Field Marshal George
- Sir Christope
- Lady Eliza
- Warlord Twelve Baby Macaws

Clicking the **Creative** button will generate a name using a random prefix and a random suffix taken from Civilization 6's unit name pools.
Examples:
- The Dirty Victory
- The Crimson Grenadiers
- The Green Horseman
- The 4th Brigade

This is not meant to be completely serious, and silly names may be generated. I will, however, try to provide some semblance of regional and/or historical accuracy for the Citizen ranks and names.

## Localization
Batch translation for multiple languages was done via Google Gemini for this mod. I expect there will be **myriads** of errors due to the AI translation, but I wanted to provide a starting point for localization and to make merging pull requests cleaner (as the files are already referenced in the modinfo). The following languages have auto-generated translations (or, complete nonsense, depending on how Gemini did):
* German, Spanish, Italian, Japanese, Korean, Polish, Portuguese (BR), Russian, Chinese (Simplified)

I have **not** translated the CitizenNames, so I welcome contributions for that pool.

If you would like to contribute a translation, please do the following:
* open a branch from the current version, update the file, and create a Pull Request.

**Note:** Given how text-heavy this mod is, I will only accept localization updates done via a Github Pull Request!

## Installation
### Recommended
It is recommended to use the [CivMods](https://civmods.com/install?modCfId=32129) manager.
### Manual
Extract to your Mods folder.
* **Windows:** %localappdata%\Firaxis Games\Sid Meier's Civilization VII\Mods
* **MacOS:** ~/Library/Application Support/Civilization VII/Mods
* **Linux:** ~/My Games/Sid Meier's Civilization VII/Mods/
* **Steam Deck:** ~/My Games/Sid Meier's Civilization VII/Mods/
Mods are enabled by default after installation.

**Note:** Please ensure mods are not nested inside an extra folder after extracting - if they are they will not work!
