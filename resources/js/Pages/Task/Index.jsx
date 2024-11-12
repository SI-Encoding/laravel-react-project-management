import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import { Head, Link, router } from "@inertiajs/react";

import TaskTable from "@/Components/TaskTable";
import { useRef, useState } from "react";
import TaskStatusCard from "@/Components/TaskStatusCard";

export default function Index({ auth, success, allTasks, totalPendingTasks, totalProgressTasks, totalCompletedTasks, queryParams = null }) {
    const [selectedStatus, setSelectedStatus] = useState(queryParams.selectedTaskStatus || "all"); // 'all', 'pending', 'in_progress', 'completed', 'active'
    const [nameFilter, setNameFilter] = useState(queryParams.name || "");
    const textInputRef = useRef(null);
    const [myPagination, setMyPagination] = useState(allTasks); 

    queryParams = queryParams || {};

    // Calculate percentages
    const pendingPercentage = totalPendingTasks;
    const progressPercentage = totalProgressTasks;
    const completedPercentage = totalCompletedTasks;

    const filteredTasks = allTasks.data.filter((task) => {
        if (selectedStatus === "all") return task.status; 
        return task.status === selectedStatus;
      });

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
    router.get(route("task.index"), { ...queryParams });
  };

  // rename to all
  const handleReset = () => {
    queryParams.selectedTaskStatus = "all";
    delete queryParams.assignedUser;
    router.get(route("task.index"), { ...queryParams });
  };

  const resetFilters = () => {

    // Reset sorting
    delete queryParams.sort_field;
    delete queryParams.sort_direction;
    delete queryParams.name;
    delete queryParams[nameFilter];
    delete queryParams.assignedUser;
    textInputRef.current.focus();
    textInputRef.current.focus();

    setNameFilter("");
    
    router.get(route("task.index"), { ...queryParams });  
  };

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("task.index"), { ...queryParams });
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    setNameFilter(name)
    searchFieldChanged(name, e.target.value);
  };

  const filterUnassignedTasks = () => {
    queryParams.selectedTaskStatus = "all"; 
    queryParams.assignedUser = "none";     
    router.get(route("task.index"), { ...queryParams });
};

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Tasks
          </h2>
          <Link
            href={route("task.create")}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
          >
            Add new
          </Link>
        </div>
      }
    >
      <Head title="Tasks" />
      <div className="py-12">
            
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-3 gap-4">

                {/* Pending Tasks Card */}
                <TaskStatusCard
                    title="Pending Tasks"
                    percentage={pendingPercentage}
                    currentCount={totalPendingTasks}
                    totalCount={totalPendingTasks}
                    gradientColors="from-yellow-300 via-amber-500 to-orange-500"
                    trailColor="#ffe0b2"
                    disableProgress={true}
                    onClick={() => {
                        // Reset sort params
                        delete queryParams.sort_field;
                        delete queryParams.sort_direction;
                        delete queryParams.assignedUser;
                        queryParams.page = 1;
                        queryParams.selectedTaskStatus = "pending";
                        router.get(route("task.index"), { ...queryParams });
                    }}
                />

                {/* In Progress Tasks Card */}
                <TaskStatusCard
                    title="In Progress Tasks"
                    percentage={progressPercentage}
                    currentCount={totalProgressTasks}
                    totalCount={totalProgressTasks}
                    gradientColors="from-blue-300 via-blue-500 to-indigo-600"
                    trailColor="#cfe2ff"
                    disableProgress={true}
                    onClick={() => {
                        // Reset sort params
                        delete queryParams.sort_field;
                        delete queryParams.sort_direction;
                        delete queryParams.assignedUser;
                        queryParams.page = 1;
                        queryParams.selectedTaskStatus = "in_progress";
                        router.get(route("task.index"), { ...queryParams });
                    }}
                />

                {/* Completed Tasks Card */}
                <TaskStatusCard
                    title="Completed Tasks"
                    percentage={completedPercentage}
                    currentCount={totalCompletedTasks}
                    totalCount={totalCompletedTasks}
                    gradientColors="from-green-300 via-green-500 to-emerald-600"
                    trailColor="#d0f0c0"
                    disableProgress={true}
                    onClick={() => {
                        // Reset sort params
                        delete queryParams.sort_field;
                        delete queryParams.sort_direction;
                        delete queryParams.assignedUser;
                        queryParams.page = 1;
                        queryParams.selectedTaskStatus = "completed";
                        router.get(route("task.index"), { ...queryParams });
                    }}
                />

                </div>

                {/* Button to reset */}
                <div className="mt-4 text-center">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-200 mr-2" // Added mr-2 for spacing
                    >
                        Show All Tasks
                    </button>
                    <button
                        onClick={filterUnassignedTasks}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                        New Tasks
                    </button>
                </div>
                <TaskTable
                    tasks = {filteredTasks}
                    taskType = "All"
                    totalPendingTasks = {totalPendingTasks}
                    totalProgressTasks = {totalProgressTasks}
                    totalCompletedTasks = {totalCompletedTasks}
                    queryParams = {queryParams}
                    sortChanged = {sortChanged}
                    selectedStatus = {selectedStatus}                
                    searchFieldChanged = {searchFieldChanged}
                    resetFilters = {resetFilters}
                    textInputRef = {textInputRef}
                    onKeyPress = {onKeyPress}
                    pagination = {myPagination}
                    auth = {auth}
                />
            </div>
    </AuthenticatedLayout>
  );
}