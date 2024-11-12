<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $sortField = $request->query('sort_field', 'due_date');
        $sortDirection = $request->query('sort_direction', 'asc');
        $selectedTaskStatus = $request->query('selectedTaskStatus', 'active');

        // Define a base query for tasks assigned to the user
        $tasksQuery = Task::query()
            ->with('project')
            ->where('assigned_user_id', $user->id)
            ->orderBy($sortField, $sortDirection);

        // Apply filtering based on selectedTaskStatus
        switch ($selectedTaskStatus) {
            case 'pending':
                $tasksQuery->where('status', 'pending');
                break;
            case 'in_progress':
                $tasksQuery->where('status', 'in_progress');
                break;
            case 'completed':
                $tasksQuery->where('status', 'completed');
                break;
            default:
                $tasksQuery->whereIn('status', ['pending', 'in_progress']);
                break;
        }

        // Filter by project name
        if ($projectName = $request->query('name')) {
            $tasksQuery->whereHas('project', function ($query) use ($projectName) {
                $query->where('name', 'like', '%' . $projectName . '%');
            });
        }

        // Paginate the tasks
        $tasks = $tasksQuery->paginate(10)->onEachSide(1);
        $activeTasks = TaskResource::collection($tasks);

        return inertia('Dashboard/Index', [
            'totalPendingTasks' => Task::where('status', 'pending')->count(),
            'myPendingTasks' => Task::where('status', 'pending')->where('assigned_user_id', $user->id)->count(),
            'totalProgressTasks' => Task::where('status', 'in_progress')->count(),
            'myProgressTasks' => Task::where('status', 'in_progress')->where('assigned_user_id', $user->id)->count(),
            'totalCompletedTasks' => Task::where('status', 'completed')->count(),
            'myCompletedTasks' => Task::where('status', 'completed')->where('assigned_user_id', $user->id)->count(),
            'activeTasks' => $activeTasks,
            'queryParams' => $request->query(),
            'success' => session('success')
        ]);
    }
}
