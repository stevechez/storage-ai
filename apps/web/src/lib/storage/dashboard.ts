import { createAdminClient } from "@/lib/supabase/admin";


export async function getDashboardStats(
    facilityId:string
){

    const supabase = createAdminClient();


    const { count: totalCalls } =
        await supabase
            .from("calls")
            .select(
                "*",
                {
                    count:"exact",
                    head:true
                }
            )
            .eq(
                "facility_id",
                facilityId
            );


    const { data: recentCalls } =
        await supabase
            .from("calls")
            .select("*")
            .eq(
                "facility_id",
                facilityId
            )
            .order(
                "created_at",
                {
                    ascending:false
                }
            )
            .limit(10);


    return {

        totalCalls: totalCalls ?? 0,

        recentCalls: recentCalls ?? []

    };

}
