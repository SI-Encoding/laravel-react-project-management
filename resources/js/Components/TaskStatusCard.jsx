// TaskStatusCard.jsx

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function TaskStatusCard({
  title,
  percentage,
  currentCount,
  totalCount,
  gradientColors,
  trailColor,
  onClick,
  disableProgress = false, // New prop with default value
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradientColors} shadow-md sm:rounded-lg p-6 hover:scale-105 hover:shadow-xl hover:cursor-pointer transition-transform duration-300`}
      onClick={onClick}
    >
      {/* Conditionally render CircularProgressbar */}
      {!disableProgress && (
        <div className="w-24 mx-auto">
          <CircularProgressbar
            value={percentage}
            text={`${Math.round(percentage)}%`}
            styles={buildStyles({
              textColor: "#fff",
              pathColor: "#fff",
              trailColor: trailColor,
            })}
          />
        </div>
      )}
      <div className="text-gray-900 dark:text-gray-100 mt-4 text-center">
        <h3 className="text-white text-xl font-semibold">{title}</h3>
        
        {/* Render only totalCount if disableProgress is true */}
        <p className="text-2xl mt-2">
          {disableProgress ? totalCount : (
            <>
              <span className="mr-1">{currentCount}</span>/
              <span className="ml-1">{totalCount}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
