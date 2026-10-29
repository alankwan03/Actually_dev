import { CalendarPicker } from './components/CalendarPicker'

export default function App() {
  return (
    <div className="min-h-screen bg-[#F0EAE1] flex flex-col justify-start">
      {/* Centered mobile viewport container per guidelines */}
      <div className="max-w-md mx-auto w-full min-h-screen p-4 bg-[#FAFAFA] shadow-lg flex flex-col justify-between">
        <CalendarPicker />
      </div>
    </div>
  )
}
