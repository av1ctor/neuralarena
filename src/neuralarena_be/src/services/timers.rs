use crate::models::timer::{Timer, TimerId, TimerTarget};
use crate::db::DB;
use neuralarena_cdk::
    db::traits::crud::{Crud, CrudSubscribable};
use neuralarena_cdk::utils::uniqueid;

pub struct TimersService {}

impl TimersService {
    pub fn create(
        duration: u64,
        target: TimerTarget
    ) -> Timer {
        let id = uniqueid::generate();
        Timer::new(id, duration, target)
    }

    pub fn cancel(
        timer: &Timer
    ) {
        if let Some(timer_id) = timer.timer_id {
            ic_cdk_timers::clear_timer(timer_id);
        }
    }
    
    pub fn insert(
        timer: &Timer,
        db: &mut DB
    ) -> Result<(), String> {
        let mut timers = db.timers.borrow_mut();

        timers.insert_and_notify(timer.id.clone(), timer.clone())
    }

    pub fn update(
        timer: &Timer,
        db: &mut DB
    ) -> Result<(), String> {
        let mut timers = db.timers.borrow_mut();

        timers.update_and_notify(timer.id.clone(), timer.clone())
    }

    pub fn delete(
        id: &TimerId,
        db: &mut DB
    ) -> Result<(), String> {
        let mut timers = db.timers.borrow_mut();

        timers.delete_and_notify(id)
    }

    pub fn find_by_id(
        id: &TimerId,
        db: &DB
    ) -> Result<Timer, String> {
        let timers = db.timers.borrow();

        match timers.find_by_id(id) {
            Some(t) => Ok(t.clone()),
            None => Err("Not found".to_string()),
        }
    }

    pub fn find_all(
        db: &DB
    ) -> Vec<Timer> {
        let timers = db.timers.borrow();

        timers.data.0.iter()
            .map(|v| v.1)
            .cloned()
            .collect()
    }

}
