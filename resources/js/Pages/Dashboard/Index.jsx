import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TaskStatusCard from "@/Components/TaskStatusCard";
import "react-circular-progressbar/dist/styles.css";
import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import TaskTable from "@/Components/TaskTable";

export default function Dashboard({
  auth,
  totalPendingTasks,
  myPendingTasks,
  totalProgressTasks,
  myProgressTasks,
  totalCompletedTasks,
  myCompletedTasks,
  activeTasks,
  queryParams = null,
}) {
  const [selectedStatus, setSelectedStatus] = useState(queryParams.selectedTaskStatus || "active"); // 'all', 'pending', 'in_progress', 'completed', 'active'
  const [nameFilter, setNameFilter] = useState(queryParams.name || "");
  const textInputRef = useRef(null);
  const [myPagination, setMyPagination] = useState(activeTasks); // Pagination for 'My' tasks

  queryParams = queryParams || {};
  // Calculate percentages
  const pendingPercentage = (myPendingTasks / totalPendingTasks) * 100 || 0;
  const progressPercentage = (myProgressTasks / totalProgressTasks) * 100 || 0;
  const completedPercentage = (myCompletedTasks / totalCompletedTasks) * 100 || 0;

  const myActiveTasks = myPendingTasks + myProgressTasks;
  
  // Filter tasks based on selected status
  const filteredTasks = activeTasks.data.filter((task) => {
    if (selectedStatus === "active") return task.status !== "completed"; 
    return task.status === selectedStatus;
  });

  // Handler to reset to all active tasks (excluding completed)
  const handleReset = () => {
    queryParams.selectedTaskStatus = "active";
    router.get(route("dashboard"), { ...queryParams });
  };

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      if (queryParams.sort_direction === "asc") {
        queryParams.sort_direction = "desc";
      } else {
        queryParams.sort_direction = "asc";
      }
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("dashboard"), { ...queryParams });
  };

  const resetFilters = () => {

    // Reset sorting
    delete queryParams.sort_field;
    delete queryParams.sort_direction;
    delete queryParams.name;
    delete queryParams[nameFilter];
    textInputRef.current.focus();
    textInputRef.current.focus();

    setNameFilter("");
    
    router.get(route("dashboard"), { ...queryParams });  
  };

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("dashboard"), { ...queryParams });
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    setNameFilter(name)
    searchFieldChanged(name, e.target.value);
  };
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-3 gap-4">

          {/* Pending Tasks Card */}
          <TaskStatusCard
            title="Pending Tasks"
            percentage={pendingPercentage}
            currentCount={myPendingTasks}
            totalCount={totalPendingTasks}
            gradientColors="from-yellow-300 via-amber-500 to-orange-500"
            trailColor="#ffe0b2"
            onClick={() => {
                // Reset sort params
                delete queryParams.sort_field;
                delete queryParams.sort_direction;
                queryParams.page = 1;
                queryParams.selectedTaskStatus = "pending";
                router.get(route("dashboard"), { ...queryParams });
              }}
          />

          {/* In Progress Tasks Card */}
          <TaskStatusCard
            title="In Progress Tasks"
            percentage={progressPercentage}
            currentCount={myProgressTasks}
            totalCount={totalProgressTasks}
            gradientColors="from-blue-300 via-blue-500 to-indigo-600"
            trailColor="#cfe2ff"
            onClick={() => {
                // Reset sort params
                delete queryParams.sort_field;
                delete queryParams.sort_direction;
                queryParams.page = 1;
                queryParams.selectedTaskStatus = "in_progress";
                router.get(route("dashboard"), { ...queryParams });
              }}
          />

          {/* Completed Tasks Card */}
          <TaskStatusCard
            title="Completed Tasks"
            percentage={completedPercentage}
            currentCount={myCompletedTasks}
            totalCount={totalCompletedTasks}
            gradientColors="from-green-300 via-green-500 to-emerald-600"
            trailColor="#d0f0c0"
            onClick={() => {
                // Reset sort params
                delete queryParams.sort_field;
                delete queryParams.sort_direction;
                queryParams.page = 1;
                queryParams.selectedTaskStatus = "completed";
                router.get(route("dashboard"), { ...queryParams });
              }}
          />

        </div>

        {/* Button to reset */}
        <div className="mt-4 text-center">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-200"
          >
            Show All Active Tasks
          </button>
        </div>

        {/* Task Table */}
        <TaskTable
            tasks = {filteredTasks}
            taskType = "My"
            queryParams = {queryParams}
            sortChanged = {sortChanged}
            selectedStatus = {selectedStatus}
            myPendingTasks = {myPendingTasks}
            myProgressTasks = {myProgressTasks}
            myCompletedTasks = {myCompletedTasks}
            myActiveTasks = {myActiveTasks}
            searchFieldChanged = {searchFieldChanged}
            resetFilters = {resetFilters}
            textInputRef = {textInputRef}
            onKeyPress = {onKeyPress}
            pagination = {myPagination}
            hideProjectColumn = {true}
        />
      </div>
    </AuthenticatedLayout>
  );
}
