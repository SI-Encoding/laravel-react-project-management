<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $sortField = $request->query('sort_field', 'due_date');
    $sortDirection = $request->query('sort_direction', 'asc');
    $selectedTaskStatus = $request->query('selectedTaskStatus', 'all');
    $assignedUser = $request->query('assignedUser', 'all'); // default to 'all'

    // Base query for all tasks without filtering by assigned_user_id
    $tasksQuery = Task::query()
        ->with(['project', 'assignedUser'])
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
            $tasksQuery->whereIn('status', ['pending', 'in_progress', 'completed']);
            break;
    }

    // Apply filtering for unassigned tasks only if assignedUser is 'none'
    if ($assignedUser === 'none') {
        $tasksQuery->whereNull('assigned_user_id');
    }

    // Filter by project name if provided
    if ($projectName = $request->query('name')) {
        $tasksQuery->whereHas('project', function ($query) use ($projectName) {
            $query->where('name', 'like', '%' . $projectName . '%');
        });
    }

    // Paginate the tasks
    $tasks = $tasksQuery->paginate(10)->onEachSide(1);
    $allTasks = TaskResource::collection($tasks);

    return inertia('Task/Index', [
        'totalPendingTasks' => Task::where('status', 'pending')->count(),
        'totalProgressTasks' => Task::where('status', 'in_progress')->count(),
        'totalCompletedTasks' => Task::where('status', 'completed')->count(),
        'allTasks' => $allTasks,
        'queryParams' => $request->query(),
        'success' => session('success')
    ]);
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $projects = Project::query()->orderBy('name', 'asc')->get();
        $users = User::query()->orderBy('name', 'asc')->get();

        return inertia("Task/Create", [
            'projects' => ProjectResource::collection($projects),
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
{
    $data = $request->validated();
    
    // Ensure 'assigned_user_id' is null if not provided
    $data['assigned_user_id'] = $data['assigned_user_id'] ?? null;
    
    /** @var $image \Illuminate\Http\UploadedFile */
    $image = $data['image'] ?? null;
    $data['created_by'] = Auth::id();
    $data['updated_by'] = Auth::id();

    if ($image) {
        $data['image_path'] = $image->store('task/' . Str::random(), 'public');
    }

    Task::create($data);

    return to_route('task.index')
        ->with('success', 'Task was created');
}


    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        return inertia('Task/Show', [
            'task' => new TaskResource($task),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        $projects = Project::query()->orderBy('name', 'asc')->get();
        $users = User::query()->orderBy('name', 'asc')->get();

        return inertia("Task/Edit", [
            'task' => new TaskResource($task),
            'projects' => ProjectResource::collection($projects),
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['updated_by'] = Auth::id();
        if ($image) {
            if ($task->image_path) {
                Storage::disk('public')->deleteDirectory(dirname($task->image_path));
            }
            $data['image_path'] = $image->store('task/' . Str::random(), 'public');
        }
        $task->update($data);

        return to_route('task.index')
            ->with('success', "Task \"$task->name\" was updated");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $name = $task->name;
        $task->delete();
        if ($task->image_path) {
            Storage::disk('public')->deleteDirectory(dirname($task->image_path));
        }
        return to_route('task.index')
            ->with('success', "Task \"$name\" was deleted");
    }

}