export async function getAvailableUnits(
    facilityId:string,
    size:string
){

    return [

        {
            id:"unit-101",
            number:"101",
            size,
            monthlyRate:140
        },

        {
            id:"unit-102",
            number:"102",
            size,
            monthlyRate:160
        }

    ];

}
