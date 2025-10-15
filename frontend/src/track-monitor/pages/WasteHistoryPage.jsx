import WasteDashboard from "../component/WasteDashboard";

export default function WasteHistoryPage(){
  // History view: full CRUD with filters/table/charts
  return <WasteDashboard
  residentId="user123"
  showHeaderCards={false}
  showCredits={false}
  showCharts={false}
  showBar
  showFilters
  showSummaryList={false}
  showForm
  showTable
  showMiniSummary={false}
/>;
}
