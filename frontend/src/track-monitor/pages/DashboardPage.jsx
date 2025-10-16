import WasteDashboard from "../component/WasteDashboard";

export default function DashboardPage(){
  // Summary view: show header cards + charts + form (if you like)
  return <WasteDashboard
  residentId="user123"
  showHeaderCards
  showCredits
  showCharts
  showBar={false}
  showFilters
  showMiniSummary  
  showSummaryList
  summaryCount={5}
  showForm={false}
  showTable={false}
/>;
}
