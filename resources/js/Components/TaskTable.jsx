import { Link } from "@inertiajs/react";
import TableHeading from "@/Components/TableHeading";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput"; 
import { TASK_STATUS_CLASS_MAP, TASK_STATUS_TEXT_MAP } from "@/constants";

const TaskTable = ({
  tasks,
  taskType,
  queryParams,
  sortChanged,
  selectedStatus,
  myPendingTasks,
  myProgressTasks,
  myCompletedTasks,
  myActiveTasks,
  totalPendingTasks,
  totalProgressTasks,
  totalCompletedTasks,
  searchFieldChanged,
  resetFilters,
  textInputRef,
  onKeyPress,
  pagination,
  hideProjectColumn = false,
  auth
}) => {
    
    const getPriorityClass = (priority) => {
        switch (priority) {
            case "low":
            return "bg-green-500";
            case "medium":
            return "bg-orange-500";
            case "high":
            return "bg-red-500";
            default:
            return "bg-gray-500";
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (selectedStatus === "all") return task.status;
        if (selectedStatus === "active") return task.status !== "completed"; 
            return task.status === selectedStatus;
    });

  const noTasksMessage = () => {
    if (selectedStatus === "all") return "No Tasks Available.";
    if (selectedStatus === "pending") return "No Pending Tasks Available.";
    if (selectedStatus === "in_progress") return "No In Progress Tasks Available.";
    if (selectedStatus === "completed") return "No Completed Tasks Available.";
    return "No Active Tasks Available.";
  };


  const taskCount =
    taskType === "My"
      ? selectedStatus === "pending"
        ? myPendingTasks
        : selectedStatus === "in_progress"
        ? myProgressTasks
        : selectedStatus === "completed"
        ? myCompletedTasks
        : myActiveTasks
      : selectedStatus === "pending"
      ? totalPendingTasks
      : selectedStatus === "in_progress"
      ? totalProgressTasks
      : selectedStatus === "completed"
      ? totalCompletedTasks
      : totalPendingTasks + totalProgressTasks + totalCompletedTasks;


    const deleteTask = (task) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }
        router.delete(route("task.destroy", task.id));
    };

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4">
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md sm:rounded-lg">
        <div className="p-6 text-gray-900 dark:text-gray-100">
          {/* Heading and filters */}
          <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-200 text-xl font-semibold">
            {selectedStatus === "pending"
                ? `${taskType === "My" ? "My" : "All"} Pending Tasks (${taskCount})`
                : selectedStatus === "in_progress"
                ? `${taskType === "My" ? "My" : "All"} In Progress Tasks (${taskCount})`
                : selectedStatus === "completed"
                ? `${taskType === "My" ? "My" : "All"} Completed Tasks (${taskCount})`
                : taskType === "My"
                ? `My Active Tasks (${taskCount})`
                : `All Tasks (${taskCount})`}
            </h3>
              <TextInput
                ref={textInputRef}
                className="w-full max-w-xs"
                defaultValue={queryParams.name}
                placeholder="Project Name"
                onBlur={(e) => searchFieldChanged("name", e.target.value)}
                onKeyPress={(e) => onKeyPress("name", e)}
              />
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
              >
                Reset Filters
              </button>
          </div>

          {/* Check if there are any tasks to display */}
          {filteredTasks.length === 0 ? (
            <p className="text-center text-lg text-gray-600 dark:text-gray-400 mt-4">
              {noTasksMessage()}
            </p>
          ) : (
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                <tr className="text-nowrap">
                  <TableHeading
                    name="id"
                    sort_field={queryParams.sort_field}
                    sort_direction={queryParams.sort_direction}
                    sortChanged={sortChanged}
                  >
                    ID
                  </TableHeading>
                  <th className="px-4 py-3">Project Name</th>
                  <TableHeading
                    name="name"
                    sort_field={queryParams.sort_field}
                    sort_direction={queryParams.sort_direction}
                    sortChanged={sortChanged}
                  >
                    Name
                  </TableHeading>
                  <TableHeading
                    name="status"
                    sort_field={queryParams.sort_field}
                    sort_direction={queryParams.sort_direction}
                    sortChanged={sortChanged}
                  >
                    Status
                  </TableHeading>
                  <TableHeading
                    name="priority"
                    sort_field={queryParams.sort_field}
                    sort_direction={queryParams.sort_direction}
                    sortChanged={sortChanged}
                  >
                    Priority
                  </TableHeading>
                  { !hideProjectColumn && (

                    <TableHeading
                        name="created_at"
                        sort_field={queryParams.sort_field}
                        sort_direction={queryParams.sort_direction}
                        sortChanged={sortChanged}
                    >
                    Created Date
                    </TableHeading>
                  )
                  
                  }
                  <TableHeading
                    name="due_date"
                    sort_field={queryParams.sort_field}
                    sort_direction={queryParams.sort_direction}
                    sortChanged={sortChanged}
                  >
                    Due Date
                  </TableHeading>
                  { !hideProjectColumn && (
                    <th className="px-3 py-3">Created By</th>
                    )
                  }
                  {!hideProjectColumn && (
                    <td className="px-4 py-3">Assigned</td>
                  )}
                  {!hideProjectColumn && (
                    <td className="px-4 py-3">Actions</td>
                  )}
                  
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">{task.id}</td>
                    <td className="px-4 py-3 text-white hover:underline">
                      <Link href={route("project.show", task.project.id)}>
                        {task.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white hover:underline">
                      <Link href={route("task.show", task.id)}>
                        {task.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap ${TASK_STATUS_CLASS_MAP[task.status]}`}
                      >
                        {TASK_STATUS_TEXT_MAP[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getPriorityClass(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    {!hideProjectColumn && (<td className="px-4 py-3 text-nowrap">{task.created_at}</td>)}
                    <td className="px-4 py-3 text-nowrap">{task.due_date}</td>
                    {!hideProjectColumn && (<td className="px-3 py-2">{task.createdBy.name}</td>)}
                    {!hideProjectColumn && (<td className="px-4 py-3">{task.assignedUser ? task.assignedUser.name : "None"}</td>)}
                    {!hideProjectColumn && (
                    <td className="px-3 py-2 text-nowrap">
                        {(task.assigned_user_id === null || task.assigned_user_id === auth.user.id) && (
                        <>
                            <Link
                            href={route("task.edit", task.id)}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1"
                            >
                            Edit
                            </Link>
                            <button
                            onClick={(e) => deleteTask(task)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline mx-1"
                            >
                            Delete
                            </button>
                        </>
                        )}
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination links={pagination.meta.links} queryParams={queryParams} />
        </div>
      </div>
    </div>
  );
};

export default TaskTable;
