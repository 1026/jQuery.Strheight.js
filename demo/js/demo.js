$(function(){
  /* demo1 */
  Strheight(
    ['.hoge','.fuga'],
    {}
  );

  /* demo2 */
  Strheight(
    [],
    {'.divideEqually-true .piyo':'p'}
  );

  Strheight(
    [],
    {'.divideEqually-false .piyo':'p'},
    {
      divideEqually: false
    }
  );

  /* demo3 */
  Strheight(
    ['.foo','.bar'],
    {'.baz':'p'}
  );
});