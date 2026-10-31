<?php

namespace App\Controllers;

class Home extends BaseController
{
    public function index(): string
    {
        return view('welcome_message');
    }

    public function homepage(){
        return view("puihaha");
    }

    public function hm($id=null){
        $data['id'] = $id;
        return view("puihaha", $data);
    }
}

