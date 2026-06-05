import { dailyRoutine } from '@/lib/daily-routine';

export function DailyRoutineTable() {
  return (
    <div className="overflow-x-auto rounded-lg border shadow-md">
      <table className="w-full text-sm md:text-base">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-3 text-left font-bold text-primary w-[120px] md:w-[150px]">TIME</th>
            <th className="px-4 py-3 text-center font-bold text-primary">AGENDA</th>
            <th className="px-4 py-3 text-right font-bold text-primary w-[140px] md:w-[180px]">DURATION</th>
          </tr>
        </thead>
        <tbody>
          {dailyRoutine.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? 'bg-background' : 'bg-muted/40'}
            >
              <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{item.time}</td>
              <td className="px-4 py-3 text-center text-foreground">
                {item.agenda.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < item.agenda.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </td>
              <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${item.highlight ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {item.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
