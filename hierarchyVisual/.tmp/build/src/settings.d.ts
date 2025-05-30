import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
/**
 * Data Point Formatting Card
 */
declare class DataPointCardSettings extends FormattingSettingsCard {
    imageHeight: formattingSettings.NumUpDown;
    imageWidth: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class ValuesCardSettings extends FormattingSettingsCard {
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    bold: formattingSettings.ToggleSwitch;
    textColor: formattingSettings.ColorPicker;
    backgroundColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class HeaderCardSettings extends FormattingSettingsCard {
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    bold: formattingSettings.ToggleSwitch;
    textColor: formattingSettings.ColorPicker;
    backgroundColor: formattingSettings.ColorPicker;
    horizontalAlignment: formattingSettings.AlignmentGroup;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
/**
 * Hierarchy Icon Formatting Card
 */
declare class HierarchyIconCardSettings extends FormattingSettingsCard {
    hierarchyIconSize: formattingSettings.NumUpDown;
    hierarchyIconColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
/**
 * Conditional Formatting Card
 */
declare class ConditionalFormattingCardSettings extends FormattingSettingsCard {
    enable: formattingSettings.ToggleSwitch;
    column: formattingSettings.TextInput;
    operator: formattingSettings.ItemDropdown;
    value: formattingSettings.TextInput;
    color: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
/**
* visual settings model class
*
*/
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    dataPointCard: DataPointCardSettings;
    valuesCard: ValuesCardSettings;
    headerCard: HeaderCardSettings;
    hierarchyIconCard: HierarchyIconCardSettings;
    conditionalFormattingCard: ConditionalFormattingCardSettings;
    cards: (ValuesCardSettings | DataPointCardSettings | HeaderCardSettings | HierarchyIconCardSettings | ConditionalFormattingCardSettings)[];
}
export {};
