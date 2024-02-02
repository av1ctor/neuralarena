use brains_engine::{
    renderer::{ModelRef, Renderer},
    env::{Asset, AssetRef},
};
use three_rs::math::{
    Vector3, Quaternion
};

struct Object {
}

pub struct NullRenderer {
    objects: Vec<Object>,
}

impl NullRenderer {
    pub fn new(
    ) -> Self {
        Self {
            objects: vec![],
        }
    }
}

impl Renderer for NullRenderer {
    fn reset(
        &mut self
    ) {
    }

    fn load_asset(
        &mut self,
        _asset_ref: AssetRef,
        _asset: &Asset
    ) -> Result<(), String> {
        Ok(())
    }

    fn add_model(
        &mut self,
        _asset_ref: AssetRef
    ) -> Result<ModelRef, String> {
        let model_ref = self.objects.len();
        self.objects.push(Object{});
        Ok(model_ref)
    }

    fn show_model(
        &mut self,
        _model_ref: ModelRef
    ) {
    }

    fn hide_model(
        &mut self,
        _model_ref: ModelRef
    ) {
    }

    fn set_position(
        &mut self,
        _model_ref: ModelRef,
        _pos: &Vector3
    ) {
    }

    fn set_rotation(
        &mut self,
        _model_ref: ModelRef,
        _q: &Quaternion
    ) {
    }

    fn set_scale(
        &mut self,
        _model_ref: ModelRef,
        _scale: &Vector3
    ) {
    }

    fn change_state(
        &mut self,
        _model_ref: ModelRef,
        _from: brains_engine::object::ObjectState,
        _to: brains_engine::object::ObjectState
    ) {
    }

    fn render(
        &mut self
    ) {
    }
}