<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class GuestLoginController extends Controller
{
    public function login()
    {
        $guestUser = User::where('email', 'test@gmail.com')->first();
        
        if ($guestUser) {
            Auth::login($guestUser);
            return redirect()->route('dashboard'); // redirect to desired page after login
        }

        return redirect()->route('login')->with('error', 'Guest account not found');
    }
}