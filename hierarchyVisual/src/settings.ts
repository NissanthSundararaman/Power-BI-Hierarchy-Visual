/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {
    imageHeight = new formattingSettings.NumUpDown({
        name: "imageHeight",
        displayName: "Image Height (px)",
        value: 40
    });

    imageWidth = new formattingSettings.NumUpDown({
        name: "imageWidth",
        displayName: "Image Width (px)",
        value: 40
    });

    name: string = "dataPoint";
    displayName: string = "Image Size";
    slices: Array<FormattingSettingsSlice> = [
        this.imageHeight,
        this.imageWidth
    ];
}

class ValuesCardSettings extends FormattingSettingsCard {
    fontFamily = new formattingSettings.FontPicker({
        name: "valuesFontFamily",
        displayName: "Font",
        value: "Segoe UI"
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "valuesFontSize",
        displayName: "Font Size",
        value: 10
    });
    bold = new formattingSettings.ToggleSwitch({
        name: "valuesBold",
        displayName: "Bold",
        value: false
    });
    textColor = new formattingSettings.ColorPicker({
        name: "valuesTextColor",
        displayName: "Text color",
        value: { value: "#000000" }
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "valuesBackgroundColor",
        displayName: "Background color",
        value: { value: "#FFFFFF" }
    });
    name: string = "values";
    displayName: string = "Values";
    slices: Array<FormattingSettingsSlice> = [
        this.fontFamily,
        this.fontSize,
        this.bold,
        this.textColor,
        this.backgroundColor
    ];
}

class HeaderCardSettings extends FormattingSettingsCard {
    fontFamily = new formattingSettings.FontPicker({
        name: "headerFontFamily",
        displayName: "Font",
        value: "Segoe UI"
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "headerFontSize",
        displayName: "Font Size",
        value: 12
    });
    bold = new formattingSettings.ToggleSwitch({
        name: "headerBold",
        displayName: "Bold",
        value: true
    });
    textColor = new formattingSettings.ColorPicker({
        name: "headerTextColor",
        displayName: "Text color",
        value: { value: "#000000" }
    });
    backgroundColor = new formattingSettings.ColorPicker({
        name: "headerBackgroundColor",
        displayName: "Background color",
        value: { value: "#FFFFFF" }
    });
    horizontalAlignment = new formattingSettings.AlignmentGroup({
        name: "headerAlignment",
        displayName: "Horizontal alignment",
        mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
        value: "left"
    });
    name: string = "header";
    displayName: string = "Column header";
    slices: Array<FormattingSettingsSlice> = [
        this.fontFamily,
        this.fontSize,
        this.bold,
        this.textColor,
        this.backgroundColor,
        this.horizontalAlignment
    ];
}

/**
 * Hierarchy Icon Formatting Card
 */
class HierarchyIconCardSettings extends FormattingSettingsCard {
    hierarchyIconSize = new formattingSettings.NumUpDown({
        name: "hierarchyIconSize",
        displayName: "Icon Size (px)",
        value: 16
    });
    hierarchyIconColor = new formattingSettings.ColorPicker({
        name: "hierarchyIconColor",
        displayName: "Icon Color",
        value: { value: "#000000" }
    });
    name: string = "hierarchyIcon";
    displayName: string = "Hierarchy icon";
    slices: Array<FormattingSettingsSlice> = [
        this.hierarchyIconSize,
        this.hierarchyIconColor
    ];
}

/**
 * Conditional Formatting Card
 */
class ConditionalFormattingCardSettings extends FormattingSettingsCard {
    enable = new formattingSettings.ToggleSwitch({
        name: "enable",
        displayName: "Enable Conditional Formatting",
        value: false
    });
    column = new formattingSettings.TextInput({
        name: "column",
        displayName: "Column Name",
        value: "",
        placeholder: "Enter column name as shown in table header"
    });
    operator = new formattingSettings.ItemDropdown({
        name: "operator",
        displayName: "Operator",
        items: [
            { value: "equals", displayName: "Equals" },
            { value: "notequals", displayName: "Not Equals" },
            { value: "contains", displayName: "Contains" },
            { value: "notcontains", displayName: "Not Contains" },
            { value: "greaterthan", displayName: "> (Greater Than)" },
            { value: "lessthan", displayName: "< (Less Than)" },
            { value: "greaterthanorequal", displayName: ">= (Greater Than or Equal)" },
            { value: "lessthanorequal", displayName: "<= (Less Than or Equal)" }
        ],
        value: { value: "equals", displayName: "Equals" }
    });
    value = new formattingSettings.TextInput({
        name: "value",
        displayName: "Value",
        value: "",
        placeholder: "Enter value to match (supports string, number, boolean)"
    });
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Highlight Color",
        value: { value: "#FFFF00" }
    });
    name: string = "conditionalFormatting";
    displayName: string = "Conditional Formatting";
    slices: Array<FormattingSettingsSlice> = [
        this.enable,
        this.column,
        this.operator,
        this.value,
        this.color
    ];
}

/**
 * visual settings model class
 *
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    dataPointCard = new DataPointCardSettings();
    valuesCard = new ValuesCardSettings();
    headerCard = new HeaderCardSettings();
    hierarchyIconCard = new HierarchyIconCardSettings();
    conditionalFormattingCard = new ConditionalFormattingCardSettings();
    cards = [
        this.dataPointCard,
        this.valuesCard,
        this.headerCard,
        this.hierarchyIconCard,
        this.conditionalFormattingCard
    ];
}
