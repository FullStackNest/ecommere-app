import React from 'react'
import ExcelUploader from '../../components/ExcelUploader/ExcelUploader'
import Insights from '../../components/Insights/Insights'

const Dashboard = () => {
  return (
    <div>
      <h3>Dashboard</h3>
      <ExcelUploader />

      <Insights />
    </div>
  )
}

export default Dashboard