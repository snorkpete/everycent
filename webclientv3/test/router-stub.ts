let RouterStub = {
  navigatedTo: null,
  navigateByUrl: function(url: string) {
    this.navigatedTo = url;
  }
}

export {RouterStub};

