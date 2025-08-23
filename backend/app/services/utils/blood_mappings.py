"""Blood group and component mappings for standardization"""

BLOOD_GROUP_MAPPING = {
    "A+": ["A+Ve", "A+", "A POSITIVE", "A POS", "A+VE", "APOSITIVE"],
    "A-": ["A-Ve", "A-", "A NEGATIVE", "A NEG", "A-VE", "ANEGATIVE"],
    "B+": ["B+Ve", "B+", "B POSITIVE", "B POS", "B+VE", "BPOSITIVE"],
    "B-": ["B-Ve", "B-", "B NEGATIVE", "B NEG", "B-VE", "BNEGATIVE"],
    "O+": ["O+Ve", "O+", "O POSITIVE", "O POS", "O+VE", "OPOSITIVE"],
    "O-": ["O-Ve", "O-", "O NEGATIVE", "O NEG", "O-VE", "ONEGATIVE"],
    "AB+": ["AB+Ve", "AB+", "AB POSITIVE", "AB POS", "AB+VE", "ABPOSITIVE"],
    "AB-": ["AB-Ve", "AB-", "AB NEGATIVE", "AB NEG", "AB-VE", "ABNEGATIVE"]
}

COMPONENT_MAPPING = {
    "Whole Blood": ["Whole Blood", "WHOLE BLOOD", "WB", "WHOLEBLOOD", "Whole-Blood"],
    "Red Blood Cells": [
        "Packed Red Blood Cells", "PRBC", "RBC", "Red Blood Cells",
        "PACKED RED BLOOD CELLS", "PackedRBC", "RedBloodCells",
        "Packed RBC", "P.R.B.C", "SAGM"
    ],
    "Plasma": [
        "Fresh Frozen Plasma", "FFP", "Plasma", "FRESH FROZEN PLASMA",
        "FreshFrozenPlasma", "F.F.P", "Frozen Plasma"
    ],
    "Platelets": [
        "Platelets", "PLT", "Platelet", "PLATELETS", "Random Donor Platelets",
        "RDP", "Single Donor Platelets", "SDP", "Platelet Concentrate"
    ],
    "Cryoprecipitate": [
        "Cryoprecipitate", "CRYO", "Cryoppt", "CRYOPRECIPITATE", "Cryo"
    ]
}

# Blood compatibility for emergency situations
BLOOD_COMPATIBILITY = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],  # Universal recipient
    "AB-": ["AB-", "A-", "B-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"]  # Universal donor
}

# Reverse compatibility (who can donate to whom)
CAN_DONATE_TO = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],  # Universal donor
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]  # Universal recipient - can only donate to AB+
}