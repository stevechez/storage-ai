export default function DashboardPage() {

return (

<div className="p-8">

<h1 className="text-4xl font-bold">
StorageAI Dashboard
</h1>


<div className="grid grid-cols-3 gap-6 mt-8">


<div className="rounded-xl border p-6">

<p className="text-sm text-muted-foreground">
Calls Today
</p>

<p className="text-4xl font-bold">
0
</p>

</div>


<div className="rounded-xl border p-6">

<p className="text-sm text-muted-foreground">
Leads Generated
</p>

<p className="text-4xl font-bold">
0
</p>

</div>



<div className="rounded-xl border p-6">

<p className="text-sm text-muted-foreground">
Rentals Started
</p>

<p className="text-4xl font-bold">
0
</p>

</div>


</div>

</div>

)

}
