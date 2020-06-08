import IliosSerializer from './ilios';

export default class OfferingSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    //don't persist this, it is handled by the server
    delete json.updatedAt;

    return json;
  }
}
