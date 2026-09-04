<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use App\Models\SiteContent;

class SiteContentManager extends Component
{
    public $activeTab = 'home';
    public $editingFields = [];
    
    public function mount()
    {
        $this->loadContent();
    }
    
    public function loadContent()
    {
        foreach (['home', 'about', 'production'] as $page) {
            $contents = SiteContent::where('page', $page)->get();
            foreach ($contents as $item) {
                $this->editingFields["{$page}.{$item->key}"] = $item->value;
            }
        }
    }
    
    public function save()
    {
        $this->loadContent();
        
        $pages = ['home', 'about', 'production'];
        foreach ($pages as $page) {
            $contents = SiteContent::where('page', $page)->get();
            foreach ($contents as $item) {
                if (isset($this->editingFields["{$page}.{$item->key}"])) {
                    $item->update(['value' => $this->editingFields["{$page}.{$item->key}"]]);
                }
            }
        }
        
        session()->flash('message', 'Content saved successfully!');
    }
    
    public function render()
    {
        $homeContent = SiteContent::where('page', 'home')->get();
        $aboutContent = SiteContent::where('page', 'about')->get();
        $productionContent = SiteContent::where('page', 'production')->get();
        
        return view('livewire.admin.site-content-manager', [
            'homeContent' => $homeContent,
            'aboutContent' => $aboutContent,
            'productionContent' => $productionContent,
        ])->layout('layouts.app');
    }
}
