<?php

namespace App\Controllers;

class Users extends BaseController
{
    public function index()
    {
        $users = [
            [
                'username'  => 'dagoatadmin',
                'full_name' => 'JP Ong',
                'role'      => 'Administrator'
            ],
            [
                'username'  => 'cashier01',
                'full_name' => 'Anna Reyes',
                'role'      => 'Cashier'
            ],
            [
                'username'  => 'cashier02',
                'full_name' => 'Mark Santos',
                'role'      => 'Cashier'
            ],
            [
                'username'  => 'manager01',
                'full_name' => 'Julia Garcia',
                'role'      => 'Manager'
            ],
            [
                'username'  => 'staff01',
                'full_name' => 'Kevin Mendoza',
                'role'      => 'Staff'
            ]
        ];

        return view('users', ['users' => $users]);
    }
}