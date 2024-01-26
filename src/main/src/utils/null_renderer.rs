use brains_engine::{
    renderer::{ModelRef, Renderer},
    env::AssetId,
    asset::GameAsset
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

impl Renderer<GameAsset> for NullRenderer {
    fn reset(
        &mut self
    ) {
    }

    fn load_asset(
        &mut self,
        _id: AssetId,
        _asset: &GameAsset
    ) -> Result<(), String> {
        Ok(())
    }

    fn add_model(
        &mut self,
        _id: AssetId
    ) -> Result<ModelRef, String> {
        let model_ref = self.objects.len();
        self.objects.push(Object{});
        Ok(model_ref)
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn add_from_lines(
        &mut self,
        _color: three_rs::core::RGB,
        _vertices: Vec<Vector3>
    ) -> Result<ModelRef, String> {
        unimplemented!()
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn add_from_linestrips(
        &mut self,
        _color: three_rs::core::RGB,
        _vertices: Vec<Vector3>
    ) -> Result<ModelRef, String> {
        unimplemented!()
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

    #[cfg(not(target_arch = "wasm32"))]
    fn set_vertices(
        &mut self,
        _model_ref: ModelRef,
        _vertices: Vec<Vector3>
    ) {
        unimplemented!()
    }

    fn render(
        &mut self
    ) {
    }
}